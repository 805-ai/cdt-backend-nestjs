import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/common/base/baseSchema';
import { UserDTO } from '../dtos/user.dto';
import { Role, UserStatus } from '../enums/role-user.enum';

@Schema()
export class User extends BaseSchema implements UserDTO {
  @Prop()
  userId: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: String, default: null })
  partnerId?: string;

  @Prop({ default: null })
  lastLoginAt?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ userId: 1 });
