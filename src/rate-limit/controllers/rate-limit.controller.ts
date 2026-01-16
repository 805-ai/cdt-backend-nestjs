import { Controller, DefaultValuePipe, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { Role } from '../../user/enums/role-user.enum';
import {
  SwaggerApiGetAllRateLimits,
  SwaggerApiGetRateLimitByPartnerId,
  SwaggerApiRateLimitController,
  SwaggerApiUpdateRateLimit,
} from '../decorators/rate-limit-swagger.decorator';
import { RateLimitUpdateRequest } from '../requests/rate-limit-create.request';
import { RateLimitService } from '../services/rate-limit.service';

@SwaggerApiRateLimitController()
@Controller({
  path: 'rate-limits',
  version: '1',
})
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get('admin/:partnerId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetRateLimitByPartnerId()
  async getRateLimitByPartnerId(@Param('partnerId') partnerId: string): Promise<any> {
    return this.rateLimitService.getRateLimitByPartnerId(partnerId);
  }

  @Get('admin/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllRateLimits()
  async getAllRateLimits(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
  ): Promise<PaginatedData<any>> {
    return this.rateLimitService.getAllRateLimits(page, perPage, search);
  }

  @Patch('admin/:partnerId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiUpdateRateLimit()
  async updateRateLimit(@Param('partnerId') partnerId: string, @Query() data: RateLimitUpdateRequest): Promise<any> {
    return this.rateLimitService.updateRateLimit(partnerId, data);
  }
}
