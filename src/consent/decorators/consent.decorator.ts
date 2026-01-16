import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConsentDTO } from '../dtos/consent.dto';
import { ConsentCreateRequest } from '../requests/consent-create.request';
import { CheckConsentRequest } from '../requests/check-consent-request';

const SWAGGER_PREFIX = 'Consent - ';

export function SwaggerApiGenerateConsent() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Generate a new consent` }),
    ApiBody({ type: ConsentCreateRequest }),
    ApiResponse({ status: 201, description: 'Consent generated', type: ConsentDTO }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiVerifyConsent() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Verify consent validity` }),
    ApiParam({ name: 'id', description: 'Consent ID', type: String }),
    ApiResponse({ status: 200, description: 'Validity status', type: Object }),
    ApiBearerAuth(),
  );
}

export const SwaggerApiCheckUserConsent = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Check if user exists and has valid consent for partner',
      description: 'Returns user creation status and consent validity for the given email and partner',
    }),
    ApiBody({
      type: CheckConsentRequest,
      description: 'Email and partner ID to check',
    }),
    ApiResponse({
      status: 200,
      description: 'User and consent status returned',
      schema: {
        example: {
          isUserCreated: true,
          isConsentValid: true,
          isConsentExpired: false,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing or invalid token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - User role not authorized',
    }),
    ApiBearerAuth(),
  );
};

export function SwaggerApiRevokeConsent() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Revoke consent` }),
    ApiParam({ name: 'id', description: 'Consent ID', type: String }),
    ApiResponse({ status: 200, description: 'Revoked consent', type: ConsentDTO }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiBeaconConsent() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Beacon (ping) consent status` }),
    ApiParam({ name: 'id', description: 'Consent ID', type: String }),
    ApiResponse({ status: 200, description: 'Active status', type: Object }),
  );
}

export function SwaggerApiGetAllConsents() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get all consents (admin only)` }),
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
    ApiResponse({ status: 200, description: 'List of consents', type: [ConsentDTO] }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiActivateConsent() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Activate a consent (admin only)` }),
    ApiParam({ name: 'id', description: 'Consent ID', type: String }),
    ApiResponse({ status: 200, description: 'Consent activated', type: ConsentDTO }),
    ApiBearerAuth(),
  );
}

export function SwaggerApiGetConsentCounts() {
  return applyDecorators(
    ApiOperation({ summary: `${SWAGGER_PREFIX}Get consent counts (admin only)` }),
    ApiResponse({
      status: 200,
      description: 'Consent counts',
      schema: {
        type: 'object',
        properties: {
          total: { type: 'number', example: 100 },
          active: { type: 'number', example: 75 },
          revoked: { type: 'number', example: 15 },
          expired: { type: 'number', example: 10 },
        },
      },
    }),
    ApiBearerAuth(),
  );
}

export const SwaggerApiConsentController = () => applyDecorators(ApiTags('consents'));
