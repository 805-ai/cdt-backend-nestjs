import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { PARTNER_ENVIRONMENT, PARTNER_STATUS, SCOPE, RATE_LIMIT_TIER } from '../../partner/enums/partner.enum';

export class RateLimitGetResponse extends BaseDTO {
  @ApiProperty({ description: 'Partner identifier' })
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ description: 'Partner environment', enum: PARTNER_ENVIRONMENT })
  @IsEnum(PARTNER_ENVIRONMENT)
  environment: PARTNER_ENVIRONMENT;

  @ApiProperty({ description: 'Partner status', enum: PARTNER_STATUS })
  @IsEnum(PARTNER_STATUS)
  status: PARTNER_STATUS;

  @ApiProperty({ description: 'Requested API scopes', enum: SCOPE, isArray: true })
  @IsEnum(SCOPE, { each: true })
  scopesRequested: SCOPE[];

  @ApiProperty({ description: 'Rate limit tier', enum: RATE_LIMIT_TIER })
  @IsEnum(RATE_LIMIT_TIER)
  rateLimitTier: RATE_LIMIT_TIER;

  @ApiProperty({ description: 'Current request count' })
  @IsInt()
  @IsNotEmpty()
  requestCount: number;

  @ApiProperty({ description: 'Last reset timestamp' })
  @IsString()
  @IsNotEmpty()
  lastReset: string;

  @ApiProperty({ description: 'Maximum allowed requests per hour', required: false })
  @IsInt()
  @IsOptional()
  maxRequests?: number;
}
