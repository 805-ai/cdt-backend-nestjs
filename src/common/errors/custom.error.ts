import { HttpException } from '@nestjs/common';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ENVIRONMENT } from '../config/secrets';

interface ErrorDetails {
  apiErrorCode: string;
  apiErrorSubCode: string;
}

export class CustomError extends HttpException {
  constructor(message: string, statusCode: HttpStatusCode, apiErrorCode: ApiErrorCode, apiErrorSubCode: ApiErrorSubCode | string, errorStack?: string) {
    const isDevelopment = ENVIRONMENT === 'development';
    const isStaging = ENVIRONMENT === 'staging';
    const showStack = isDevelopment || isStaging;

    const response: {
      errors: string[];
      status: number;
      errorDetails: ErrorDetails;
      stack?: string;
    } = {
      errors: [message],
      status: statusCode,
      errorDetails: {
        apiErrorCode,
        apiErrorSubCode: apiErrorSubCode.toString(),
      },
    };

    if (showStack && errorStack) {
      response.stack = errorStack;
    }

    super(response, statusCode);

    if (showStack) {
      this.stack = errorStack || this.stack;
    } else {
      delete this.stack;
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
