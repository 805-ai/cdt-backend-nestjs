import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { differenceInSeconds } from 'date-fns';
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { PartnerService } from 'src/partner/services/partner.service';
import { RATE_LIMIT_TIER, SCOPE } from '../../partner/enums/partner.enum';
import { RateLimitDAO } from '../daos/rate-limit.dao';
import { RateLimitDTO } from '../dtos/rate-limit.dto';
import { RateLimitUpdateRequest } from '../requests/rate-limit-create.request';
import { RateLimitGetResponse } from '../responses/rate-limit-create.response';
import { getAppConfig } from 'src/common/config/app.config';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private rateLimits: { [tier: string]: number } = {};

  constructor(private readonly rateLimitDAO: RateLimitDAO, private readonly partnerService: PartnerService, private readonly configService: ConfigService) {
    this.initializeRateLimits();
  }

  private initializeRateLimits(): void {
    const appConfig = getAppConfig(this.configService);
    this.rateLimits = {
      [RATE_LIMIT_TIER.FREE]: appConfig.rateLimit.freeTier,
      [RATE_LIMIT_TIER.PRO]: appConfig.rateLimit.proTier,
      [RATE_LIMIT_TIER.ENTERPRISE]: appConfig.rateLimit.enterpriseTier,
    };
  }

  async checkRateLimit(partnerId: string, scope: SCOPE): Promise<void> {
    const partner = await this.partnerService.getPartnerById(partnerId);
    if (!partner) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);

    const now = new Date();
    const nowISO = now.toISOString();
    const config = getAppConfig(this.configService);
    const windowSeconds = config.rateLimit.windowSeconds;
    const maxRequests = this.rateLimits[partner.rateLimitTier] || config.rateLimit.defaultTier;

    let rateLimit = await this.rateLimitDAO.findByPartnerId(partnerId);

    if (!rateLimit) {
      rateLimit = await this.rateLimitDAO.create({
        partnerId,
        environment: partner.environment,
        status: partner.status,
        scopesRequested: partner.scopesRequested,
        rateLimitTier: partner.rateLimitTier,
        requestCount: 0,
        lastReset: nowISO,
        maxRequests,
      });
    } else if (differenceInSeconds(now, new Date(rateLimit.lastReset)) >= windowSeconds) {
      rateLimit = await this.rateLimitDAO.update(rateLimit.id, { requestCount: 0, lastReset: nowISO });
    }

    if (!rateLimit.scopesRequested.includes(scope)) {
      throw new CustomError(`Partner not authorized for ${scope} scope.`, HttpStatusCode.FORBIDDEN, ApiErrorCode.RATE_LIMIT, ApiErrorSubCode.FORBIDDEN_ACCESS);
    }

    if (rateLimit.requestCount >= maxRequests) {
      const resetTime = new Date(new Date(rateLimit.lastReset).getTime() + windowSeconds * 1000);
      const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      throw new HttpException(
        {
          message: 'Rate limit exceeded.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
        {
          cause: new Error(`Rate limit exceeded for partner ${partnerId}`),
        },
      );
    }

    // Atomically increment requestCount
    rateLimit = await this.rateLimitDAO.incrementField({ partnerId }, 'requestCount');
  }

  async getRateLimitByPartnerId(partnerId: string): Promise<RateLimitGetResponse> {
    const rateLimit = await this.rateLimitDAO.findByPartnerId(partnerId);
    if (!rateLimit) throw new CustomError('Rate limit not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.RATE_LIMIT, ApiErrorSubCode.NOT_FOUND);
    return {
      id: rateLimit.id,
      createdAt: rateLimit.createdAt,
      updatedAt: rateLimit.updatedAt,
      partnerId: rateLimit.partnerId,
      environment: rateLimit.environment,
      status: rateLimit.status,
      scopesRequested: rateLimit.scopesRequested,
      rateLimitTier: rateLimit.rateLimitTier,
      requestCount: rateLimit.requestCount,
      lastReset: rateLimit.lastReset,
      maxRequests: rateLimit.maxRequests,
    };
  }

  async updateRateLimit(partnerId: string, data: RateLimitUpdateRequest): Promise<RateLimitDTO> {
    const rateLimit = await this.rateLimitDAO.findByPartnerId(partnerId);
    if (!rateLimit) throw new CustomError('Rate limit not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.RATE_LIMIT, ApiErrorSubCode.NOT_FOUND);

    if (data.rateLimitTier && !Object.values(RATE_LIMIT_TIER).includes(data.rateLimitTier)) {
      throw new CustomError('Invalid rate limit tier.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.RATE_LIMIT, ApiErrorSubCode.INVALID_INPUT);
    }

    if (data.maxRequests !== undefined && (data.maxRequests < 0 || data.maxRequests > getAppConfig(this.configService).rateLimit.maxRequestsLimit)) {
      throw new CustomError(
        `Max requests must be between 0 and ${getAppConfig(this.configService).rateLimit.maxRequestsLimit}.`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.RATE_LIMIT,
        ApiErrorSubCode.INVALID_INPUT,
      );
    }

    return this.rateLimitDAO.update(rateLimit.id, data);
  }

  async getAllRateLimits(page: number, perPage: number, search?: string): Promise<PaginatedData<RateLimitDTO>> {
    const filter: any = {};
    if (search) filter.partnerId = { $regex: search, $options: 'i' };
    return this.rateLimitDAO.find(filter, ['*'], page, perPage);
  }
}
