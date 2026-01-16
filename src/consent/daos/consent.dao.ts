import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { ConsentDTO } from '../dtos/consent.dto';
import { Consent, ConsentDocument } from '../schemas/consent.schema';

@Injectable()
export class ConsentDAO extends BaseDAO<ConsentDocument, ConsentDTO> {
  constructor(@InjectModel(Consent.name) consentModel: Model<ConsentDocument>) {
    super(consentModel);
  }

  async findByUserId(userId: string): Promise<PaginatedData<ConsentDTO>> {
    return this.find({ userId }, ['*'], 1, 10);
  }

  async findByPartnerId(partnerId: string): Promise<PaginatedData<ConsentDTO>> {
    return this.find({ partnerId }, ['*'], 1, 10);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaginatedData<ConsentDTO>> {
    return this.find({ idempotencyKey }, ['*'], 1, 1);
  }

  async countDocuments(filter: any): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
