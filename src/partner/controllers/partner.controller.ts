import { Body, Controller, DefaultValuePipe, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import {
  SwaggerApiActivatePartner,
  SwaggerApiCreatePartner,
  SwaggerApiDeactivatePartner,
  SwaggerApiDeleteSelfPartnerProfile,
  SwaggerApiGetAllPartners,
  SwaggerApiGetPartnerById,
  SwaggerApiGetSelfPartnerProfile,
  SwaggerApiSearchPartners,
  SwaggerApiUpdatePartnerById,
  SwaggerApiPartnerController,
  SwaggerApiUpdatePartnerStatus,
  SwaggerApiGetPartnersByStatus,
} from '../decorators/partner-swagger.decorator';
import { PartnerDTO } from '../dtos/partner.dto';
import { PartnerCreateRequest } from '../requests/partner-create.request';
import { PartnerCreateResponse } from '../responses/partner-create.response';
import { Role } from '../../user/enums/role-user.enum';
import { PartnerUpdateRequest } from '../requests/partner-update.request';
import { PartnerService } from '../services/partner.service';
import { PARTNER_STATUS } from '../enums/partner.enum';
import { UpdatePartnerStatusRequest } from '../requests/update-partner.request';
import { GetPartnersByStatusRequest } from '../requests/partner-status.request';

@SwaggerApiPartnerController()
@Controller({
  path: 'partners',
  version: '1',
})
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) { }

  @Get('partner/:id')
  @UseGuards(AuthGuard)
  @SwaggerApiGetPartnerById()
  async getPartnerById(@Param('id', MongoIdValidationPipe) id: string): Promise<PartnerDTO> {
    return this.partnerService.getPartnerById(id);
  }

  @Put('self')
  @UseGuards(AuthGuard)
  @SwaggerApiUpdatePartnerById()
  async updateSelfPartnerProfile(@UserId() userId: string, @Body() data: PartnerUpdateRequest): Promise<PartnerDTO> {
    return await this.partnerService.updateSelfPartnerProfile(userId, data);
  }

  @Get('self')
  @UseGuards(AuthGuard)
  @SwaggerApiGetSelfPartnerProfile()
  async getSelfPartnerProfile(@UserId() userId: string): Promise<PartnerDTO> {
    return this.partnerService.getSelfPartnerProfile(userId);
  }

  @Patch('self')
  @UseGuards(AuthGuard)
  @SwaggerApiDeleteSelfPartnerProfile()
  async deleteSelfPartnerProfile(@UserId() userId: string): Promise<PartnerDTO> {
    return await this.partnerService.deleteSelfPartnerProfile(userId);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllPartners()
  async getAllPartnersAdmin(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('environment') environment?: string,
  ): Promise<PaginatedData<PartnerDTO>> {
    return this.partnerService.getPartnersAdmin(page, perPage, search, status, environment);
  }

  @Post('admin/create')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiCreatePartner()
  async createPartnerAdmin(@Body() data: PartnerCreateRequest): Promise<PartnerCreateResponse> {
    return this.partnerService.createPartner(data);
  }

  @Patch('admin/:id/activate')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiActivatePartner()
  async activatePartnerAdmin(@Param('id', MongoIdValidationPipe) id: string): Promise<PartnerDTO> {
    const partner = await this.partnerService.getPartnerById(id);
    if (partner.status !== PARTNER_STATUS.PENDING) {
      throw new CustomError('Partner can only be activated from PENDING status.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.PARTNER, ApiErrorSubCode.INVALID_TRANSITION);
    }
    return this.partnerService.updatePartner(id, { status: PARTNER_STATUS.ACTIVE });
  }

  @Patch('admin/:id/deactivate')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiDeactivatePartner()
  async deactivatePartnerAdmin(@Param('id', MongoIdValidationPipe) id: string): Promise<PartnerDTO> {
    const partner = await this.partnerService.getPartnerById(id);

    if (partner.status === PARTNER_STATUS.DEACTIVATED) {
      throw new CustomError('Partner is already deactivated.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.PARTNER, ApiErrorSubCode.INVALID_TRANSITION);
    }
    return this.partnerService.updatePartner(id, { status: PARTNER_STATUS.DEACTIVATED });
  }

  @Get('admin/search')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiSearchPartners()
  async searchPartnersAdmin(
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
  ): Promise<PaginatedData<PartnerDTO>> {
    return this.partnerService.searchPartnersAdmin(search, page, perPage);
  }

  @Get('admin/stats')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  async getPartnerStats(): Promise<{ total: number, pending: number, active: number, rejected: number, deactivated: number }> {
    return this.partnerService.getPartnerStats();
  }

  @Get('admin/pending')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  async getPendingPartners(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
  ): Promise<PaginatedData<PartnerDTO>> {
    return this.partnerService.getPendingPartners(page, perPage);
  }

  @Patch('admin/:id/status')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiUpdatePartnerStatus()
  async updatePartnerStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() data: UpdatePartnerStatusRequest,
  ): Promise<PartnerDTO> {
    return this.partnerService.updatePartnerStatus(id, data);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetPartnersByStatus()
  async getPartnersByStatus(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Body() data: GetPartnersByStatusRequest,
  ): Promise<PaginatedData<PartnerDTO>> {
    return this.partnerService.getPartnersByStatus(data.status, page, perPage);
  }
}
