import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { CredentialDTO } from '../dtos/credential.dto';
import { Credential, CredentialDocument } from '../schemas/credential.schema';

@Injectable()
export class CredentialDAO extends BaseDAO<CredentialDocument, CredentialDTO> {
  constructor(@InjectModel(Credential.name) credentialModel: Model<CredentialDocument>) {
    super(credentialModel);
  }

  async findByPartnerId(partnerId: string): Promise<CredentialDTO | null> {
    const credentials = await this.find({ partnerId }, ['*'], 1, 1);
    return credentials.data.length > 0 ? credentials.data[0] : null;
  }
}
