import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { CustomError } from '../errors/custom.error';

@Injectable()
export class PaginationPipe implements PipeTransform {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_PER_PAGE = 10;
  private readonly MAX_PER_PAGE = 1000;

  transform(value: any, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null || value === '') {
      return this.getDefaultValue(metadata.data);
    }

    if (Array.isArray(value)) {
      throw new CustomError(
        `${metadata.data} parameter cannot be an array. Please provide a single integer value (e.g., ${metadata.data}=1).`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    const strValue = `${value}`.trim();
    if (strValue === '') {
      return this.getDefaultValue(metadata.data);
    }

    const parsed = parseInt(strValue, 10);
    if (isNaN(parsed)) {
      throw new CustomError(
        `${metadata.data} must be a valid integer. Received '${value}'. Please provide a numeric value (e.g., ${metadata.data}=1).`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    if (parsed < 1) {
      throw new CustomError(
        `${metadata.data} must be greater than or equal to 1. Received ${parsed}. Please provide a positive integer.`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    if (metadata.data === 'perPage' && parsed > this.MAX_PER_PAGE) {
      throw new CustomError(
        `perPage cannot exceed ${this.MAX_PER_PAGE} items per page. Received ${parsed}. Please use a smaller value to ensure optimal performance.`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    return parsed;
  }

  private getDefaultValue(paramName: string): number {
    switch (paramName) {
      case 'page':
        return this.DEFAULT_PAGE;
      case 'perPage':
        return this.DEFAULT_PER_PAGE;
      default:
        return 1;
    }
  }
}
