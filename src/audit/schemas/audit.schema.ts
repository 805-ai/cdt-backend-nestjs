import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { AuditDTO } from '../dtos/audit.dto';
import { AuditAction, AuditStatus } from '../enums/audit.enum';

@Schema()
export class Audit extends BaseSchema implements AuditDTO {
  @Prop({ enum: AuditAction, required: true })
  action: AuditAction;

  @Prop()
  userId?: string;

  @Prop()
  partnerId?: string;

  @Prop()
  consentId?: string;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  details: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ enum: AuditStatus, default: AuditStatus.PENDING })
  status: AuditStatus;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export type AuditDocument = Audit & Document;

export const AuditSchema = SchemaFactory.createForClass(Audit);

// indexes
AuditSchema.index({ timestamp: -1 });
AuditSchema.index({ userId: 1 });
AuditSchema.index({ partnerId: 1 });
AuditSchema.index({ consentId: 1 });
