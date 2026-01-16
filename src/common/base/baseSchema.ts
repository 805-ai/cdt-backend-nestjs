import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class BaseSchema extends Document {
  @Prop()
  id: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}
