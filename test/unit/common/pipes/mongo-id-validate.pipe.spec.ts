import { ArgumentMetadata } from '@nestjs/common';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id-validate.pipe';

jest.mock('src/common/enums/codes/api-error-subcode.enum', () => ({
  ApiErrorSubCode: {
    INVALID_DATA: '1001',
  },
}));

describe('MongoIdValidationPipe', () => {
  let pipe: MongoIdValidationPipe;
  const metadata: ArgumentMetadata = { type: 'param' };

  beforeEach(() => {
    pipe = new MongoIdValidationPipe();
  });

  it('should return valid ObjectId', () => {
    expect(pipe.transform('507f1f77bcf86cd799439011', metadata)).toBe('507f1f77bcf86cd799439011');
  });

  it('should throw CustomError for invalid ObjectId', () => {
    expect(() => pipe.transform('invalid-id', metadata)).toThrow(
      new CustomError('Invalid MongoDB ID.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, ApiErrorSubCode.INVALID_DATA),
    );
  });
});
