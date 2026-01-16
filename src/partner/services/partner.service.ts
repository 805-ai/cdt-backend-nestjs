import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { Role } from '../../user/enums/role-user.enum';
import { UserService } from '../../user/services/user.service';
import { PartnerDAO } from '../daos/partner.dao';
import { PartnerDTO } from '../dtos/partner.dto';
import { PARTNER_STATUS } from '../enums/partner.enum';
import { PartnerCreateRequest } from '../requests/partner-create.request';
import { PartnerUpdateRequest } from '../requests/partner-update.request';
import { PartnerCreateResponse } from '../responses/partner-create.response';
import { UpdatePartnerStatusRequest } from '../requests/update-partner.request';

@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  constructor(
    private readonly partnerDAO: PartnerDAO,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  async getPartnerById(id: string): Promise<PartnerDTO> {
    return await this.partnerDAO.findById(id);
  }

  async getPartnerByOwnerUserId(ownerUserId: string): Promise<PartnerDTO | null> {
    const partners = await this.partnerDAO.find({ ownerUserId }, ['*']);
    return partners.data.length > 0 ? partners.data[0] : null;
  }

  async getPartners(filter: any = {}, page: number, perPage: number): Promise<PaginatedData<PartnerDTO>> {
    return this.partnerDAO.find(filter, ['*'], page, perPage);
  }

  async createPartner(data: PartnerCreateRequest): Promise<PartnerCreateResponse> {
    const existingPartner = await this.partnerDAO.find({ contactEmail: data.contactEmail }, ['id']);

    if (existingPartner.data.length > 0) {
      throw new CustomError('Contact email already exists.', HttpStatusCode.CONFLICT, ApiErrorCode.PARTNER, ApiErrorSubCode.ALREADY_EXISTS);
    }

    const user = await this.userService.findSession(data.ownerUserId);
    if (!user) {
      throw new CustomError('Owner user not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    }

    const createdPartner = await this.partnerDAO.create({
      ...data,
      status: PARTNER_STATUS.PENDING,
    });

    const ownerUser = await this.userService.getSelfUserProfile(data.ownerUserId);

    return {
      id: createdPartner.id,
      createdAt: createdPartner.createdAt,
      updatedAt: createdPartner.updatedAt,
      orgName: createdPartner.orgName,
      contactEmail: createdPartner.contactEmail,
      appName: createdPartner.appName,
      status: createdPartner.status,
      environment: createdPartner.environment,
      scopesRequested: createdPartner.scopesRequested,
      ownerUser,
    };
  }

  async getSelfPartnerProfile(userId: string): Promise<PartnerDTO> {
    const partners = await this.partnerDAO.find({ ownerUserId: userId }, ['*'], 1, 1);
    if (partners.data.length === 0) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);
    return partners.data[0];
  }

  async updateSelfPartnerProfile(userId: string, data: PartnerUpdateRequest): Promise<PartnerDTO> {
    const partners = await this.partnerDAO.find({ ownerUserId: userId }, ['id'], 1, 1);
    if (partners.data.length === 0) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);
    return this.partnerDAO.update(partners.data[0].id, data);
  }

  async deleteSelfPartnerProfile(userId: string): Promise<PartnerDTO> {
    throw new CustomError(
      'Please contact the platform owner to deactivate your partner profile as it may affect associated users.',
      HttpStatusCode.FORBIDDEN,
      ApiErrorCode.PARTNER,
      ApiErrorSubCode.NOT_ALLOWED,
    );
  }

  async updatePartner(id: string, data: Partial<PartnerDTO>): Promise<PartnerDTO> {
    const partner = await this.getPartnerById(id);
    if (!partner) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);
    return this.partnerDAO.update(id, data);
  }

  async getPartnersAdmin(page: number, perPage: number, search?: string, status?: string, environment?: string): Promise<PaginatedData<PartnerDTO>> {
    const filter: any = {};

    if (search) {
      filter.$or = [{ orgName: { $regex: search, $options: 'i' } }, { appName: { $regex: search, $options: 'i' } }, { contactEmail: { $regex: search, $options: 'i' } }];
    }

    if (status) {
      filter.status = status;
    }

    if (environment) {
      filter.environment = environment;
    }

    return this.getPartners(filter, page, perPage);
  }

  async searchPartnersAdmin(search: string, page: number, perPage: number): Promise<PaginatedData<PartnerDTO>> {
    const filter: any = {
      $or: [{ orgName: { $regex: search, $options: 'i' } }, { appName: { $regex: search, $options: 'i' } }, { contactEmail: { $regex: search, $options: 'i' } }],
    };
    return this.getPartners(filter, page, perPage);
  }

  async getPartnerStats(): Promise<{
    total: number,
    pending: number,
    active: number,
    rejected: number,
    deactivated: number,
    totalUsers: number
  }> {
    const totalPartners = await this.getPartners({}, 1, 1);
    const pendingPartners = await this.getPartners({ status: PARTNER_STATUS.PENDING }, 1, 1);
    const activePartners = await this.getPartners({ status: PARTNER_STATUS.ACTIVE }, 1, 1);
    const rejectedPartners = await this.getPartners({ status: PARTNER_STATUS.REJECTED }, 1, 1);
    const deactivatedPartners = await this.getPartners({ status: PARTNER_STATUS.DEACTIVATED }, 1, 1);

    const totalUsers = await this.userService.getUserStats();

    return {
      total: totalPartners.data.length,
      pending: pendingPartners.data.length,
      active: activePartners.data.length,
      rejected: rejectedPartners.data.length,
      deactivated: deactivatedPartners.data.length,
      totalUsers: totalUsers.total,
    };
  }

  async getPendingPartners(page: number, perPage: number): Promise<PaginatedData<PartnerDTO>> {
    const filter = { status: PARTNER_STATUS.PENDING };
    return this.getPartners(filter, page, perPage);
  }

  async updatePartnerStatus(id: string, data: UpdatePartnerStatusRequest): Promise<PartnerDTO> {
    const partner = await this.getPartnerByOwnerUserId(id);
    if (!partner) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);

    if (partner.status === data.status) {
      throw new CustomError('Partner is already in this status.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.PARTNER, ApiErrorSubCode.INVALID_TRANSITION);
    }

    if (partner.status === PARTNER_STATUS.PENDING && ![PARTNER_STATUS.APPROVED, PARTNER_STATUS.REJECTED].includes(data.status)) {
      throw new CustomError('Pending partners can only be approved or rejected.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.PARTNER, ApiErrorSubCode.INVALID_TRANSITION);
    }

    return this.partnerDAO.update(id, { status: data.status });
  }

  async getPartnersByStatus(status: PARTNER_STATUS, page: number, perPage: number): Promise<PaginatedData<PartnerDTO>> {
    const filter = { status };
    return this.getPartners(filter, page, perPage);
  }
}
