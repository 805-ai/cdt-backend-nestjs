import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { RATE_LIMIT_TIER } from '../../partner/enums/partner.enum';

export class RateLimitUpdateRequest {
  @ApiProperty({ description: 'Rate limit tier', enum: RATE_LIMIT_TIER })
  @IsEnum(RATE_LIMIT_TIER)
  @IsOptional()
  rateLimitTier?: RATE_LIMIT_TIER;

  @ApiProperty({ description: 'Maximum allowed requests per hour', required: false })
  @IsInt()
  @IsOptional()
  maxRequests?: number;
}
