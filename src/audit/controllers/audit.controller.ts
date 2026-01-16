import { Body, Controller, DefaultValuePipe, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { Role } from '../../user/enums/role-user.enum';
import { SwaggerApiAuditController, SwaggerApiCreateAudit, SwaggerApiGetAllAudits, SwaggerApiGetAuditById, SwaggerApiUpdateAudit } from '../decorators/audit-swagger.decorator';
import { AuditCreateRequest } from '../requests/audit-create.request';
import { AuditUpdateRequest } from '../requests/audit-update.request';
import { AuditService } from '../services/audit.service';

@SwaggerApiAuditController()
@Controller({
  path: 'audits',
  version: '1',
})
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('admin/create')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiCreateAudit()
  async createAudit(@Body() data: AuditCreateRequest, @Request() req): Promise<any> {
    return this.auditService.createAudit(data, req);
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAuditById()
  async getAuditById(@Param('id', MongoIdValidationPipe) id: string): Promise<any> {
    return this.auditService.getAuditById(id);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllAudits()
  async getAllAudits(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
    @Query('action') action?: string,
  ): Promise<PaginatedData<any>> {
    return this.auditService.getAllAudits(page, perPage, search, action);
  }

  @Patch('admin/:id/update')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiUpdateAudit()
  async updateAudit(@Param('id', MongoIdValidationPipe) id: string, @Body() data: AuditUpdateRequest): Promise<any> {
    return this.auditService.updateAudit(id, data);
  }
}
