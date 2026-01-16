import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document, FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { getAppConfig } from '../config/app.config';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { DBSORT } from '../enums/sort.enum';
import { CustomError } from '../errors/custom.error';

export interface PaginationMetadata {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export type DTOCreate<T> = Pick<T, keyof T>;

@Injectable()
export abstract class BaseDAO<T extends Document, U> {
  protected readonly configService: ConfigService;

  constructor(protected readonly model: Model<T>, @Optional() private readonly configServiceInstance?: ConfigService) {
    this.configService = configServiceInstance || new ConfigService();
    if (!this.configService.get('PAGINATION_MAX_NON_PAGINATED_LIMIT')) {
      console.warn('ConfigService not properly initialized in BaseDAO. Ensure ConfigModule is global.');
    }
  }

  protected defaultFields: string[] = ['id', 'createdAt', 'updatedAt'];

  async findById(id: string): Promise<T | null> {
    const document = await this.model.findById(id).select('-__v').lean().exec();
    if (!document) {
      throw new CustomError(`Document with ID '${id}' not found`, HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    }
    document.id = document._id.toString();
    delete document._id;
    return document as T;
  }

  async create(data: DTOCreate<U>): Promise<T> {
    const res = await this.model.create(data);
    const { _id, __v, ...result } = res.toObject();
    result.id = _id.toString();
    return result as T;
  }

  async delete(id: string): Promise<string> {
    const existing = await this.model.findById(id);
    if (!existing) {
      throw new CustomError(`Document with ID '${id}' not found`, HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    }
    await existing.deleteOne();
    return id;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const updatedData = { ...data, updatedAt: new Date() };
    const document = await this.model.findByIdAndUpdate(id, { $set: updatedData }, { new: true, projection: { __v: 0 }, lean: true }).exec();
    if (!document) {
      throw new CustomError(`Document with ID '${id}' not found`, HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    }
    document.id = document._id.toString();
    delete document._id;
    return document;
  }

  async incrementField(filter: FilterQuery<T>, field: keyof T, incrementBy: number = 1): Promise<T | null> {
    const update: any = { $inc: { [field]: incrementBy }, $set: { updatedAt: new Date() } };
    const document = await this.model.findOneAndUpdate(filter, update, { new: true, upsert: true, projection: { __v: 0 }, lean: true }).exec();
    document.id = document._id.toString();
    delete document._id;
    return document as T;
  }

  async find(
    filter: FilterQuery<T>,
    selectFields?: (keyof T | '*')[],
    page?: number,
    perPage?: number,
    sort: Partial<Record<keyof U, DBSORT>> = getAppConfig(this.configService).api.defaultSort as Partial<Record<keyof U, DBSORT>>,
  ): Promise<PaginatedData<T>> {
    const normalizedFilter: FilterQuery<T> = { ...filter };
    if (normalizedFilter.hasOwnProperty('id')) {
      normalizedFilter['_id'] = normalizedFilter['id'];
      delete normalizedFilter['id'];
    }

    const isPaginated = page !== undefined && perPage !== undefined;
    if (isPaginated) {
      if (page < 1 || perPage < 1) {
        throw new CustomError('Page and perPage must be at least 1', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
      }
    }

    let fieldsToSelect: string[] = this.defaultFields;
    if (selectFields && selectFields.length > 0) {
      if (selectFields.includes('*')) {
        fieldsToSelect = Object.keys(this.model.schema.paths).filter((field) => field !== '__v');
      } else {
        const schemaFields = new Set(Object.keys(this.model.schema.paths));
        fieldsToSelect = (selectFields as string[]).filter((field) => schemaFields.has(field)) || this.defaultFields;
      }
    }

    const config = getAppConfig(this.configService);
    const total = await this.model.countDocuments(normalizedFilter).exec();
    const maxNonPaginatedLimit = config.pagination.maxNonPaginatedLimit;
    const effectiveLimit = isPaginated ? perPage! : Math.min(total, maxNonPaginatedLimit);

    const query = this.model.find(normalizedFilter).select(fieldsToSelect.join(' ')).select('-__v').sort(sort);
    if (isPaginated) {
      query.skip(perPage! * (page! - 1)).limit(perPage!);
    } else if (total > maxNonPaginatedLimit) {
      console.warn(`Non-paginated query limited to ${maxNonPaginatedLimit} documents. Total: ${total}`);
      query.limit(maxNonPaginatedLimit);
    }

    const data = await query.lean().exec();
    const mappedData = data.map((item: any) => {
      const { _id, ...rest } = item;
      return { id: _id.toString(), ...rest };
    });

    const lastPage = isPaginated && perPage ? Math.ceil(total / perPage) : 1;
    return {
      data: mappedData,
      metadata: {
        total,
        page: isPaginated && page ? page : 1,
        perPage: isPaginated && perPage ? perPage : effectiveLimit,
        lastPage,
        hasNext: isPaginated && page ? page < lastPage : false,
        hasPrevious: isPaginated && page ? page > 1 : false,
      },
    };
  }
}
