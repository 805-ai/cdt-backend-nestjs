import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { PARTNER_ENVIRONMENT, PARTNER_STATUS, RATE_LIMIT_TIER, SCOPE } from '../../partner/enums/partner.enum';
import { RateLimitDTO } from '../dtos/rate-limit.dto';

@Schema({ collection: 'rate_limits' })
export class RateLimit extends BaseSchema implements RateLimitDTO {
  @Prop({ required: true })
  partnerId: string;

  @Prop({ enum: PARTNER_ENVIRONMENT, required: true })
  environment: PARTNER_ENVIRONMENT;

  @Prop({ enum: PARTNER_STATUS, required: true })
  status: PARTNER_STATUS;

  @Prop({ enum: SCOPE, type: [String], required: true })
  scopesRequested: SCOPE[];

  @Prop({ enum: RATE_LIMIT_TIER, required: true })
  rateLimitTier: RATE_LIMIT_TIER;

  @Prop({ required: true, default: 0 })
  requestCount: number;

  @Prop({ required: true })
  lastReset: string;

  @Prop({ required: false })
  maxRequests?: number;
}

export type RateLimitDocument = RateLimit & Document;

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);

RateLimitSchema.index({ partnerId: 1, environment: 1 }, { unique: true });
