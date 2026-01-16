import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { CredentialDTO } from '../dtos/credential.dto';
import { CREDENTIAL_STATUS } from '../enums/credential.enum';

@Schema()
export class Credential extends BaseSchema implements CredentialDTO {
  @Prop({ required: true, unique: true })
  credentialId: string;

  @Prop({ required: true })
  partnerId: string;

  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  secret: string;

  @Prop({ enum: CREDENTIAL_STATUS, default: CREDENTIAL_STATUS.ACTIVE })
  status: CREDENTIAL_STATUS;

  @Prop()
  revokedAt?: string;

  @Prop({ required: true })
  kid: string;

  @Prop({ required: false })
  expiresAt?: string;
}

export type CredentialDocument = Credential & Document;

export const CredentialSchema = SchemaFactory.createForClass(Credential);

CredentialSchema.index({ partnerId: 1 });
CredentialSchema.index({ clientId: 1 });
