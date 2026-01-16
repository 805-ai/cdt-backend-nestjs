import { Body, Controller, DefaultValuePipe, Get, Param, Patch, Post, Query, UseGuards, Headers } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import {
  SwaggerApiActivateConsent,
  SwaggerApiBeaconConsent,
  SwaggerApiCheckUserConsent,
  SwaggerApiConsentController,
  SwaggerApiGenerateConsent,
  SwaggerApiGetAllConsents,
  SwaggerApiGetConsentCounts,
  SwaggerApiRevokeConsent,
  SwaggerApiVerifyConsent,
} from '../decorators/consent.decorator';
import { Role } from '../../user/enums/role-user.enum';
import { ConsentDTO } from '../dtos/consent.dto';
import { ConsentCreateRequest } from '../requests/consent-create.request';
import { ConsentService } from '../services/consent.service';
import { CheckConsentRequest } from '../requests/check-consent-request';
import { CheckConsentResponse } from '../responses/check-consent.response';

@SwaggerApiConsentController()
@Controller({
  path: 'consents',
  version: '1',
})
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('consents')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @SwaggerApiGenerateConsent()
  async generateConsent(
    @UserId() userId: string,
    @Body() data: ConsentCreateRequest,
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Headers('x-timestamp') timestamp: string,
  ): Promise<ConsentDTO> {
    return this.consentService.generateConsent(userId, data, idempotencyKey, timestamp);
  }

  @Post('check-user-consent')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER)
  @SwaggerApiCheckUserConsent()
  async checkUserConsent(@Body() data: CheckConsentRequest, @UserId() partnerRequestId: string): Promise<CheckConsentResponse> {
    return this.consentService.checkUserAndConsent(data, partnerRequestId);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @SwaggerApiVerifyConsent()
  async verifyConsent(@Body('id', MongoIdValidationPipe) id: string, @Headers('x-timestamp') timestamp: string): Promise<{ valid: boolean }> {
    return this.consentService.verifyConsent(id, timestamp);
  }

  @Post('revoke')
  @UseGuards(AuthGuard)
  @SwaggerApiRevokeConsent()
  async revokeConsent(
    @UserId() userId: string,
    @Body('id', MongoIdValidationPipe) id: string,
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Headers('x-timestamp') timestamp: string,
  ): Promise<ConsentDTO> {
    return this.consentService.revokeConsent(userId, id, idempotencyKey, timestamp);
  }

  @Post('beacon')
  @SwaggerApiBeaconConsent()
  async beaconConsent(@Body('id', MongoIdValidationPipe) id: string, @Headers('x-timestamp') timestamp: string): Promise<{ active: boolean }> {
    return this.consentService.beaconConsent(id, timestamp);
  }

  @Get('admin/consents')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllConsents()
  async getAllConsentsAdmin(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<PaginatedData<ConsentDTO>> {
    return this.consentService.getConsentsAdmin(page, perPage, search, status);
  }

  @Patch('admin/consents/:id/activate')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiActivateConsent()
  async activateConsentAdmin(@Param('id', MongoIdValidationPipe) id: string): Promise<ConsentDTO> {
    return this.consentService.activateConsent(id);
  }

  @Get('admin/consents/counts')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetConsentCounts()
  async getConsentCountsAdmin(): Promise<{
    total: number;
    active: number;
    revoked: number;
    expired: number;
  }> {
    return this.consentService.getConsentCounts();
  }
}
