import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserDTO } from '../dtos/user.dto';
import { UserCreateRequest } from '../requests/user-create.request';
import { UserCreateResponse } from '../responses/user-create.response';
import { UserUpdateRequest } from '../requests/user-update.request';

const SWAGGER_PREFIX = 'User - ';

export function SwaggerApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Create a new user` }),
    ApiBody({ type: UserCreateRequest }),
    ApiResponse({
      status: 201,
      description: 'User created',
      type: UserCreateResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input or duplicate email',
    }),
  );
}

export function SwaggerApiGetAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all users (paginated)` }),
    ApiQuery({
      name: 'page',
      type: Number,
      description: 'Page number',
      example: 1,
    }),
    ApiQuery({
      name: 'perPage',
      type: Number,
      description: 'Items per page',
      example: 10,
    }),
    ApiResponse({ status: 200, description: 'List of users', type: [UserDTO] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetUserById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get user by ID` }),
    ApiParam({ name: 'id', description: 'User ID', type: String }),
    ApiResponse({ status: 200, description: 'User details', type: UserDTO }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function SwaggerApiUpdateUserById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Update current user profile` }),
    ApiBody({ type: UserUpdateRequest }),
    ApiResponse({
      status: 200,
      description: 'Updated user details',
      type: UserDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetSelfUserProfile() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get current user profile` }),
    ApiResponse({
      status: 200,
      description: 'Current user details',
      type: UserDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiDeleteSelfUserProfile() {
  return applyDecorators(
    ApiOperation({
      summary: `${SWAGGER_PREFIX}Delete (deactivate) current user profile`,
    }),
    ApiResponse({
      status: 200,
      description: 'Deactivated user details',
      type: UserDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiOnboardPartnerUser() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Onboard partner user (admin only)` }),
    ApiBody({ type: UserCreateRequest }),
    ApiResponse({
      status: 201,
      description: 'Partner user created successfully',
      type: UserCreateResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid role - must be PARTNER',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - admin access required',
    }),
    ApiBearerAuth(),
  );
}

export const SwaggerApiUserController = () => applyDecorators(ApiTags('users'));
