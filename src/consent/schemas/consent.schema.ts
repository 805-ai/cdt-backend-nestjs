import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { ConsentDTO } from '../dtos/consent.dto';
import { CONSENT_PURPOSE, CONSENT_STATUS } from '../enums/consent.enum';

@Schema()
export class Consent extends BaseSchema implements ConsentDTO {
  @Prop({ required: true })
  consentId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  partnerId: string;

  @Prop({ type: [String], enum: Object.values(CONSENT_PURPOSE), required: true })
  purposes: CONSENT_PURPOSE[];

  @Prop({ enum: CONSENT_STATUS, default: CONSENT_STATUS.PENDING })
  status: CONSENT_STATUS;

  @Prop({ required: true })
  grantedAt: string;

  @Prop()
  revokedAt?: string;

  @Prop()
  expiresAt?: string;

  @Prop({ required: true })
  signature: string;

  @Prop({ required: true })
  epoch: number;

  @Prop()
  idempotencyKey?: string;
}

export type ConsentDocument = Consent & Document;

export const ConsentSchema = SchemaFactory.createForClass(Consent);

ConsentSchema.index({ userId: 1 });
ConsentSchema.index({ partnerId: 1 });
ConsentSchema.index({ consentId: 1 });
