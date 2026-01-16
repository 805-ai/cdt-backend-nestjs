import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAppConfig } from '../config/app.config';
import { CustomError } from '../errors/custom.error';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}

  transform(value: Express.Multer.File | Express.Multer.File[], metadata: ArgumentMetadata) {
    const appConfig = getAppConfig(this.configService);

    if (value && !Array.isArray(value)) {
      this.validateSingleFile(value, appConfig);
      return value;
    }

    if (Array.isArray(value)) {
      this.validateBatchFiles(value, appConfig);
      return value;
    }

    if (!value) {
      throw new CustomError('File must be provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
    }

    return value;
  }

  private validateSingleFile(file: Express.Multer.File, appConfig: any) {
    if (!file) {
      throw new CustomError('File must be provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
    }

    if (file.size > appConfig.fileStorage.maxFileSizeBytes) {
      throw new CustomError(
        `File size (${file.size} bytes) exceeds maximum allowed size of ${appConfig.fileStorage.maxFileSizeBytes} bytes`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.FILE_STORAGE,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    if (!file.originalname || file.originalname.trim() === '') {
      throw new CustomError('File must have a valid filename', HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
    }

    if (!file.mimetype) {
      throw new CustomError('File must have a valid MIME type', HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
    }
  }

  private validateBatchFiles(files: Express.Multer.File[], appConfig: any) {
    if (!files || files.length === 0) {
      throw new CustomError('At least one file must be provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
    }

    if (files.length > appConfig.fileStorage.maxBatchFiles) {
      throw new CustomError(
        `Cannot upload more than ${appConfig.fileStorage.maxBatchFiles} files at once. Received ${files.length} files.`,
        HttpStatusCode.BAD_REQUEST,
        ApiErrorCode.FILE_STORAGE,
        ApiErrorSubCode.INVALID_DATA,
      );
    }

    files.forEach((file, index) => {
      try {
        this.validateSingleFile(file, appConfig);
      } catch (error) {
        throw new CustomError(`File ${index + 1} (${file.originalname}): ${error.message}`, HttpStatusCode.BAD_REQUEST, ApiErrorCode.FILE_STORAGE, ApiErrorSubCode.INVALID_DATA);
      }
    });
  }
}
