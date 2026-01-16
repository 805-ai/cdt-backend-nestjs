import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';

jest.mock('src/common/config/secrets', () => ({
  ENVIRONMENT: 'development',
}));

jest.mock('src/common/enums/codes/api-error-subcode.enum', () => ({
  ApiErrorSubCode: {
    INVALID_DATA: '1001',
  },
}));

jest.mock('src/common/enums/codes/api-error.enum', () => ({
  ApiErrorCode: {
    VALIDATION: 'VALIDATION',
  },
}));

describe('CustomError', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create error with response and stack in development', () => {
    process.env.ENVIRONMENT = 'development';

    const { CustomError: TestCustomError } = require('src/common/errors/custom.error');

    const error = new TestCustomError('Test', HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, ApiErrorSubCode.INVALID_DATA, 'stack trace');

    expect(error.getResponse()).toEqual({
      errors: ['Test'],
      status: HttpStatusCode.BAD_REQUEST,
      errorDetails: { apiErrorCode: 'VALIDATION', apiErrorSubCode: '1001' },
      stack: 'stack trace',
    });
    expect(error.stack).toBe('stack trace');
  });

  it('should hide stack in production', () => {
    process.env.ENVIRONMENT = 'production';
    const { CustomError: TestCustomError } = require('src/common/errors/custom.error');

    const error = new TestCustomError('Test', HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, ApiErrorSubCode.INVALID_DATA);

    const response = error.getResponse();
    expect(response).toEqual({
      errors: ['Test'],
      status: HttpStatusCode.BAD_REQUEST,
      errorDetails: { apiErrorCode: 'VALIDATION', apiErrorSubCode: '1001' },
    });
    expect(response.stack).toBeUndefined();
    expect(error.stack).toBeDefined();
  });
});
