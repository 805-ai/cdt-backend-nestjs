import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PartnerDTO } from '../dtos/partner.dto';
import { PartnerUpdateRequest } from '../requests/partner-update.request';
import { PartnerCreateRequest } from '../requests/partner-create.request';
import { PartnerCreateResponse } from '../responses/partner-create.response';

const SWAGGER_PREFIX = 'Partner - ';

export function SwaggerApiGetPartnerById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get partner by ID` }),
    ApiParam({ name: 'id', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Partner details', type: PartnerDTO }),
    ApiResponse({ status: 404, description: 'Partner not found' }),
  );
}

export function SwaggerApiUpdatePartnerById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Update current partner profile` }),
    ApiBody({ type: PartnerUpdateRequest }),
    ApiResponse({
      status: 200,
      description: 'Updated partner details',
      type: PartnerDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetSelfPartnerProfile() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get current partner profile` }),
    ApiResponse({
      status: 200,
      description: 'Current partner details',
      type: PartnerDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiDeleteSelfPartnerProfile() {
  return applyDecorators(
    ApiOperation({
      summary: `${SWAGGER_PREFIX}Delete (deactivate) current partner profile`,
    }),
    ApiResponse({
      status: 200,
      description: 'Deactivated partner details',
      type: PartnerDTO,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetAllPartners() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all partners (admin only)` }),
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
    ApiQuery({
      name: 'search',
      type: String,
      description: 'Search term',
      required: false,
    }),
    ApiQuery({
      name: 'status',
      type: String,
      description: 'Filter by status',
      required: false,
    }),
    ApiQuery({
      name: 'environment',
      type: String,
      description: 'Filter by environment',
      required: false,
    }),
    ApiResponse({ status: 200, description: 'List of partners', type: [PartnerDTO] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiCreatePartner() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Create a new partner (admin only)` }),
    ApiBody({ type: PartnerCreateRequest }),
    ApiResponse({
      status: 201,
      description: 'Partner created',
      type: PartnerCreateResponse,
    }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiActivatePartner() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Activate a partner (admin only)` }),
    ApiParam({ name: 'id', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Partner activated', type: PartnerDTO }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiDeactivatePartner() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Deactivate a partner (admin only)` }),
    ApiParam({ name: 'id', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Partner deactivated', type: PartnerDTO }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiUpdatePartnerStatus() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Update partner status (admin only)` }),
    ApiParam({ name: 'id', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Partner status updated', type: PartnerDTO }),
    ApiResponse({ status: 400, description: 'Invalid status transition' }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetPartnersByStatus() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get partners by status (admin only)` }),
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
    ApiResponse({ status: 200, description: 'List of partners by status', type: [PartnerDTO] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiSearchPartners() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Search partners (admin only)` }),
    ApiQuery({
      name: 'search',
      type: String,
      description: 'Search term',
      required: true,
    }),
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
    ApiResponse({ status: 200, description: 'Search results', type: [PartnerDTO] }),
    ApiBearerAuth(),
  );
}

export const SwaggerApiPartnerController = () => applyDecorators(ApiTags('partners'));
