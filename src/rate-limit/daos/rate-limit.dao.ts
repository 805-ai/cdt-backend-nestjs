import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { RateLimitDTO } from '../dtos/rate-limit.dto';
import { RateLimit, RateLimitDocument } from '../schemas/rate-limit.schema';

@Injectable()
export class RateLimitDAO extends BaseDAO<RateLimitDocument, RateLimitDTO> {
  constructor(@InjectModel(RateLimit.name) rateLimitModel: Model<RateLimitDocument>) {
    super(rateLimitModel);
  }

  async findByPartnerId(partnerId: string): Promise<RateLimitDTO | null> {
    const rateLimits = await this.find({ partnerId }, ['*'], 1, 1);
    return rateLimits.data.length > 0 ? rateLimits.data[0] : null;
  }
}
