import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { CustomError } from '../errors/custom.error';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const isValidObjectId = Types.ObjectId.isValid(value);
    if (!isValidObjectId) {
      throw new CustomError('Invalid MongoDB ID.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, ApiErrorSubCode.INVALID_DATA);
    }
    return value;
  }
}
