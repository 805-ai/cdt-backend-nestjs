import { ArgumentMetadata } from '@nestjs/common';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';

describe('PaginationPipe', () => {
  let pipe: PaginationPipe;
  const metadata: ArgumentMetadata = { type: 'query', data: 'page' };

  beforeEach(() => {
    pipe = new PaginationPipe();
  });

  it('should return default value if input is undefined', () => {
    expect(pipe.transform(undefined, metadata)).toBe(1);
  });

  it('should parse valid integer input', () => {
    expect(pipe.transform('5', metadata)).toBe(5);
  });

  it('should throw CustomError for invalid input (non-number)', () => {
    expect(() => pipe.transform('abc', metadata)).toThrow(
      new CustomError(
        "page must be a valid integer. Received 'abc'. Please provide a numeric value (e.g., page=1).",
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      ),
    );
  });

  it('should throw CustomError for value less than 1', () => {
    expect(() => pipe.transform('0', metadata)).toThrow(
      new CustomError(
        'page must be greater than or equal to 1. Received 0. Please provide a positive integer.',
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      ),
    );
  });

  it('should throw CustomError for array input', () => {
    expect(() => pipe.transform(['1', '2'], metadata)).toThrow(
      new CustomError(
        'page parameter cannot be an array. Please provide a single integer value (e.g., page=1).',
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.VALIDATION,
        ApiErrorSubCode.INVALID_DATA,
      ),
    );
  });
});
