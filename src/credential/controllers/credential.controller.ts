import { Body, Controller, DefaultValuePipe, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';

import { Role } from '../../user/enums/role-user.enum';
import {
  SwaggerApiCreateCredential,
  SwaggerApiCredentialController,
  SwaggerApiGetAllCredentials,
  SwaggerApiGetCredentialById,
  SwaggerApiRevokeCredential,
} from '../decorators/credential-swagger.decorator';
import { CredentialCreateRequest } from '../requests/credential-create.request';
import { CredentialService } from '../services/credential.service';

@SwaggerApiCredentialController()
@Controller({
  path: 'credentials',
  version: '1',
})
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post('admin/create')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiCreateCredential()
  async createCredential(@Body() data: CredentialCreateRequest): Promise<any> {
    return this.credentialService.createCredential(data);
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetCredentialById()
  async getCredentialById(@Param('id', MongoIdValidationPipe) id: string): Promise<any> {
    return this.credentialService.getCredentialById(id);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllCredentials()
  async getAllCredentials(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<PaginatedData<any>> {
    return this.credentialService.getAllCredentials(page, perPage, search, status);
  }

  @Patch('admin/:id/revoke')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiRevokeCredential()
  async revokeCredential(@Param('id', MongoIdValidationPipe) id: string): Promise<any> {
    return this.credentialService.revokeCredential(id);
  }
}
