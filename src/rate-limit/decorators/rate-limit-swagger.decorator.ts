import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

const SWAGGER_PREFIX = 'Rate Limit - ';

export function SwaggerApiRateLimitController() {
  return applyDecorators(ApiTags('rate-limits'));
}

export function SwaggerApiGetRateLimitByPartnerId() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get rate limit by partner ID` }),
    ApiParam({ name: 'partnerId', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Rate limit details', type: Object }),
    ApiResponse({ status: 404, description: 'Rate limit not found' }),
  );
}

export function SwaggerApiGetAllRateLimits() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all rate limits (paginated)` }),
    ApiQuery({ name: 'page', type: Number, description: 'Page number', example: 1 }),
    ApiQuery({ name: 'perPage', type: Number, description: 'Items per page', example: 10 }),
    ApiResponse({ status: 200, description: 'List of rate limits', type: [Object] }),
  );
}

export function SwaggerApiUpdateRateLimit() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Update rate limit` }),
    ApiParam({ name: 'partnerId', description: 'Partner ID', type: String }),
    ApiResponse({ status: 200, description: 'Rate limit updated', type: Object }),
  );
}
