import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CredentialCreateRequest } from '../requests/credential-create.request';
import { CredentialUpdateRequest } from '../requests/credential-update.request';

const SWAGGER_PREFIX = 'Credential - ';

export function SwaggerApiCredentialController() {
  return applyDecorators(ApiTags('credentials'));
}

export function SwaggerApiCreateCredential() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Create a new credential` }),
    ApiBody({ type: CredentialCreateRequest }),
    ApiResponse({ status: 201, description: 'Credential created', type: Object }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetCredentialById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get credential by ID` }),
    ApiParam({ name: 'id', description: 'Credential ID', type: String }),
    ApiResponse({ status: 200, description: 'Credential details', type: Object }),
    ApiResponse({ status: 404, description: 'Credential not found' }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetAllCredentials() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all credentials (paginated)` }),
    ApiQuery({ name: 'page', type: Number, description: 'Page number', example: 1 }),
    ApiQuery({ name: 'perPage', type: Number, description: 'Items per page', example: 10 }),
    ApiResponse({ status: 200, description: 'List of credentials', type: [Object] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiRevokeCredential() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Revoke a credential` }),
    ApiParam({ name: 'id', description: 'Credential ID', type: String }),
    ApiResponse({ status: 200, description: 'Credential revoked', type: Object }),
    ApiBearerAuth(),
  );
}
