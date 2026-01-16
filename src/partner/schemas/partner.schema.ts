import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { PartnerDTO } from '../dtos/partner.dto';
import { PARTNER_ENVIRONMENT, PARTNER_STATUS, RATE_LIMIT_TIER, SCOPE } from '../enums/partner.enum';

@Schema()
export class Partner extends BaseSchema implements PartnerDTO {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  orgName: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop({ required: true, minlength: 3, maxlength: 50 })
  appName: string;

  @Prop()
  callbackURL?: string;

  @Prop({ enum: PARTNER_ENVIRONMENT, required: true })
  environment: PARTNER_ENVIRONMENT;

  @Prop({ type: [String], enum: Object.values(SCOPE), required: true })
  scopesRequested: SCOPE[];

  @Prop({ enum: RATE_LIMIT_TIER, required: true })
  rateLimitTier: RATE_LIMIT_TIER;

  @Prop({ enum: PARTNER_STATUS, default: PARTNER_STATUS.PENDING })
  status: PARTNER_STATUS;

  @Prop()
  webhookUrl?: string;

  @Prop({ required: true })
  ownerUserId: string;
}

export type PartnerDocument = Partner & Document;

export const PartnerSchema = SchemaFactory.createForClass(Partner);

PartnerSchema.index({ contactEmail: 1 });
PartnerSchema.index({ orgName: 1 });
PartnerSchema.index({ ownerUserId: 1 });
