import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Model, Document } from 'mongoose';
import { BaseDAO, PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { DBSORT } from 'src/common/enums/sort.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue({
      pagination: { maxNonPaginatedLimit: 500 },
      api: { defaultSort: { createdAt: -1 } },
    }),
  })),
}));

jest.mock('src/common/config/app.config', () => ({
  getAppConfig: jest.fn().mockReturnValue({
    pagination: { maxNonPaginatedLimit: 500 },
    api: { defaultSort: { createdAt: -1 } },
  }),
}));

jest.mock('src/common/enums/codes/api-error-subcode.enum', () => ({
  ApiErrorSubCode: {
    INVALID_DATA: '1001',
  },
}));

interface MockDocument extends Document {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

class MockDAO extends BaseDAO<MockDocument, { name: string }> {
  constructor(model: Model<MockDocument>, configService?: ConfigService) {
    super(model, configService);
  }
}

describe('BaseDAO', () => {
  let dao: MockDAO;
  let model: jest.Mocked<Model<MockDocument>>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    model = {
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndDelete: jest.fn(),
      schema: {
        paths: {
          _id: {},
          name: {},
          createdAt: {},
          updatedAt: {},
          __v: {},
        },
      },
    } as any;

    configService = new ConfigService() as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [MockDAO, { provide: ConfigService, useValue: configService }],
    })
      .overrideProvider(MockDAO)
      .useValue(new MockDAO(model, configService))
      .compile();

    dao = module.get<MockDAO>(MockDAO);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a document when found', async () => {
      const mockDoc = {
        _id: '123',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      model.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDoc),
      } as any);

      const result = await dao.findById('123');
      expect(result).toEqual({ id: '123', name: 'Test', createdAt: expect.any(Date), updatedAt: expect.any(Date) });
      expect(model.findById).toHaveBeenCalledWith('123');
    });

    it('should throw CustomError if document not found', async () => {
      model.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(dao.findById('123')).rejects.toThrow(
        new CustomError("Document with ID '123' not found", HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
      );
    });
  });

  describe('create', () => {
    it('should create and return a document', async () => {
      const mockDoc = {
        _id: '123',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        toObject: jest.fn().mockReturnValue({
          _id: '123',
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };
      model.create.mockImplementation(() => Promise.resolve(mockDoc));

      const result = await dao.create({ name: 'Test' });
      expect(result).toEqual({ id: '123', name: 'Test', createdAt: expect.any(Date), updatedAt: expect.any(Date) });
      expect(model.create).toHaveBeenCalledWith({ name: 'Test' });
      expect(mockDoc.toObject).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return a document', async () => {
      const mockDoc = {
        _id: '123',
        name: 'Updated',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      } as any);

      const result = await dao.update('123', { name: 'Updated' });
      expect(result).toEqual({ id: '123', name: 'Updated', createdAt: expect.any(Date), updatedAt: expect.any(Date) });
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('123', { $set: { name: 'Updated', updatedAt: expect.any(Date) } }, { new: true, projection: { __v: 0 }, lean: true });
    });

    it('should throw CustomError if document not found', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(dao.update('123', { name: 'Updated' })).rejects.toThrow(
        new CustomError("Document with ID '123' not found", HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
      );
    });
  });

  describe('delete', () => {
    it('should delete a document and return its ID', async () => {
      model.findById.mockReturnValue({
        deleteOne: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await dao.delete('123');
      expect(result).toBe('123');
      expect(model.findById).toHaveBeenCalledWith('123');
    });

    it('should throw CustomError if document not found', async () => {
      model.findById.mockReturnValue(null);

      await expect(dao.delete('123')).rejects.toThrow(
        new CustomError("Document with ID '123' not found", HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
      );
    });
  });

  describe('find', () => {
    it('should return paginated data for valid query', async () => {
      const mockDocs = [
        { _id: '123', name: 'Test1', createdAt: new Date(), updatedAt: new Date() },
        { _id: '124', name: 'Test2', createdAt: new Date(), updatedAt: new Date() },
      ];
      model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(2) } as any);
      model.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocs),
      } as any);

      const result: PaginatedData<MockDocument> = await dao.find({}, ['*'], 1, 10, { name: DBSORT.ASCENDING });
      expect(result.data).toEqual([
        { id: '123', name: 'Test1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { id: '124', name: 'Test2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
      ]);
      expect(result.metadata).toEqual({
        total: 2,
        page: 1,
        perPage: 10,
        lastPage: 1,
        hasNext: false,
        hasPrevious: false,
      });
      expect(model.find).toHaveBeenCalledWith({});
      expect(model.countDocuments).toHaveBeenCalledWith({});
    });

    it('should throw CustomError for invalid page or perPage', async () => {
      await expect(dao.find({}, ['*'], 0, 10)).rejects.toThrow(
        new CustomError('Page and perPage must be at least 1', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
      );
    });
  });
});
