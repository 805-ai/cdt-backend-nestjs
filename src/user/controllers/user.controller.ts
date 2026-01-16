// File: src/user/controllers/user.controller.ts
import { Body, Controller, DefaultValuePipe, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PaginatedData } from 'src/common/base/baseDAO';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import {
  SwaggerApiDeleteSelfUserProfile,
  SwaggerApiGetAllUsers,
  SwaggerApiGetSelfUserProfile,
  SwaggerApiGetUserById,
  SwaggerApiUpdateUserById,
  SwaggerApiUserController,
} from '../decorators/user-swagger.decorator';
import { UserDTO } from '../dtos/user.dto';
import { Role } from '../enums/role-user.enum';
import { UserUpdateRequest } from '../requests/user-update.request';
import { UserService } from '../services/user.service';
import { PartnerSignupRequest } from '../requests/partner-signup.request';
import { UserCreateResponse } from '../responses/user-create.response';

@SwaggerApiUserController()
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('/partner/onboard')
  async partnerSignup(@Body() data: PartnerSignupRequest): Promise<UserCreateResponse> {
    return this.userService.onboardPartner(data);
  }
  @Get('user/:id')
  @UseGuards(AuthGuard)
  @SwaggerApiGetUserById()
  async getUserById(@Param('id', MongoIdValidationPipe) id: string): Promise<UserDTO> {
    return this.userService.getUserProfileById(id);
  }

  @Put('self')
  @UseGuards(AuthGuard)
  @SwaggerApiUpdateUserById()
  async updateUserById(@UserId() userId: string, @Body() data: UserUpdateRequest): Promise<UserDTO> {
    return await this.userService.updateUserProfileById(userId, data);
  }

  @Get('self')
  @UseGuards(AuthGuard)
  @SwaggerApiGetSelfUserProfile()
  async getSelfUserProfile(@UserId() userId: string): Promise<UserDTO> {
    return this.userService.getSelfUserProfile(userId);
  }

  @Patch('self')
  @UseGuards(AuthGuard)
  @SwaggerApiDeleteSelfUserProfile()
  async deleteSelfUserProfile(@UserId() userId: string): Promise<UserDTO> {
    return await this.userService.deleteUserProfile(userId);
  }

  @Get('admin/users/list')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.OWNER)
  @SwaggerApiGetAllUsers()
  async getAllUsersAdmin(
    @Query('page', new DefaultValuePipe(1), PaginationPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), PaginationPipe) perPage: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
  ): Promise<PaginatedData<UserDTO & { consentCount: number; lastLogin: string }>> {
    return this.userService.getUsersforDashboard(page, perPage, search, status, role);
  }

  @Get('admin/stats')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async getUserStats(): Promise<{ total: number; active: number; admins: number; deactivated: number }> {
    return this.userService.getUserStats();
  }
}
