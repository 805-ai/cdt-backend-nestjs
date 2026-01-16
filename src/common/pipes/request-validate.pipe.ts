import { ValidationPipe, ValidationError } from '@nestjs/common';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { CustomError } from '../errors/custom.error';

export class CustomValidationPipe extends ValidationPipe {
  protected override exceptionFactory = (errors: ValidationError[]) => {
    const messages = errors.map((err) => `${err.property} - ${Object.values(err.constraints).join(', ')}`);

    return new CustomError('Validation failed', 400, ApiErrorCode.VALIDATION, messages.join('; '));
  };
}
