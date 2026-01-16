import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditCreateRequest } from '../requests/audit-create.request';
import { AuditUpdateRequest } from '../requests/audit-update.request';

const SWAGGER_PREFIX = 'Audit - ';

export function SwaggerApiAuditController() {
  return applyDecorators(ApiTags('audits'));
}

export function SwaggerApiCreateAudit() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Create a new audit entry` }),
    ApiBody({ type: AuditCreateRequest }),
    ApiResponse({ status: 201, description: 'Audit created', type: Object }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetAuditById() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get audit by ID` }),
    ApiParam({ name: 'id', description: 'Audit ID', type: String }),
    ApiResponse({ status: 200, description: 'Audit details', type: Object }),
    ApiResponse({ status: 404, description: 'Audit not found' }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetAllAudits() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all audits (paginated)` }),
    ApiQuery({ name: 'page', type: Number, description: 'Page number', example: 1 }),
    ApiQuery({ name: 'perPage', type: Number, description: 'Items per page', example: 10 }),
    ApiResponse({ status: 200, description: 'List of audits', type: [Object] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiUpdateAudit() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Update an audit entry` }),
    ApiParam({ name: 'id', description: 'Audit ID', type: String }),
    ApiBody({ type: AuditUpdateRequest }),
    ApiResponse({ status: 200, description: 'Audit updated', type: Object }),
    ApiBearerAuth(),
  );
}
