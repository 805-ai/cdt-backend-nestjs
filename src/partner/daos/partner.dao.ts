import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { PartnerDTO } from '../dtos/partner.dto';
import { Partner, PartnerDocument } from '../schemas/partner.schema';

@Injectable()
export class PartnerDAO extends BaseDAO<PartnerDocument, PartnerDTO> {
  constructor(@InjectModel(Partner.name) partnerModel: Model<PartnerDocument>) {
    super(partnerModel);
  }

  async findByContactEmail(contactEmail: string): Promise<PartnerDTO | null> {
    const filter = { contactEmail };
    const partners = await this.find(filter, ['*'], 1, 1);
    return partners.data.length > 0 ? partners.data[0] : null;
  }

  async findByOwnerUserId(ownerUserId: string): Promise<PartnerDTO | null> {
    const filter = { ownerUserId };
    const partners = await this.find(filter, ['*'], 1, 1);
    return partners.data.length > 0 ? partners.data[0] : null;
  }

  async existsByOrgName(orgName: string): Promise<boolean> {
    const partners = await this.find({ orgName }, ['*'], 1, 1);
    return partners.data.length > 0;
  }

  async searchPartners(filter: any, page: number, perPage: number): Promise<PaginatedData<PartnerDTO>> {
    return this.find(filter, ['*'], page, perPage);
  }
}
