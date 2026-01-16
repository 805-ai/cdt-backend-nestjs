import { registerAs } from '@nestjs/config';

export interface AppConfig {
  pagination: {
    defaultPerPage: number;
    maxPerPage: number;
    maxNonPaginatedLimit: number;
  };
  fileStorage: {
    maxPrivateFileExpirationSeconds: number;
    privateBucketName: string;
    maxFileSizeBytes: number;
    largeFileThresholdBytes: number;
    multipartPartSizeBytes: number;
    multipartQueueSize: number;
    maxBatchFiles: number;
  };
  api: {
    defaultSort: Record<string, any>;
  };
  rateLimit: {
    freeTier: number;
    proTier: number;
    enterpriseTier: number;
    defaultTier: number;
    maxRequestsLimit: number;
    windowSeconds: number;
  };
}

export const CONFIG_DEFAULTS: AppConfig = {
  pagination: {
    defaultPerPage: 10,
    maxPerPage: 100,
    maxNonPaginatedLimit: 500,
  },
  fileStorage: {
    maxPrivateFileExpirationSeconds: 604800,
    privateBucketName: 'private-bucket',
    maxFileSizeBytes: 104857600,
    largeFileThresholdBytes: 104857600,
    multipartPartSizeBytes: 10485760,
    multipartQueueSize: 4,
    maxBatchFiles: 10,
  },
  api: {
    defaultSort: { createdAt: -1 },
  },
  rateLimit: {
    freeTier: 1000,
    proTier: 50000,
    enterpriseTier: 1000000,
    defaultTier: 1000,
    maxRequestsLimit: 1000000,
    windowSeconds: 900, // 15 minutes
  },
} as const;

export default registerAs('app', () => ({
  pagination: {
    defaultPerPage: parseInt(process.env.PAGINATION_DEFAULT_PER_PAGE, 10) || CONFIG_DEFAULTS.pagination.defaultPerPage,
    maxPerPage: parseInt(process.env.PAGINATION_MAX_PER_PAGE, 10) || CONFIG_DEFAULTS.pagination.maxPerPage,
    maxNonPaginatedLimit: parseInt(process.env.PAGINATION_MAX_NON_PAGINATED_LIMIT, 10) || CONFIG_DEFAULTS.pagination.maxNonPaginatedLimit,
  },
  fileStorage: {
    maxPrivateFileExpirationSeconds: parseInt(process.env.FILE_STORAGE_MAX_PRIVATE_FILE_EXPIRATION_SECONDS, 10) || CONFIG_DEFAULTS.fileStorage.maxPrivateFileExpirationSeconds,
    privateBucketName: process.env.FILE_STORAGE_PRIVATE_BUCKET_NAME || CONFIG_DEFAULTS.fileStorage.privateBucketName,
    maxFileSizeBytes: parseInt(process.env.FILE_STORAGE_MAX_FILE_SIZE_BYTES, 10) || CONFIG_DEFAULTS.fileStorage.maxFileSizeBytes,
    largeFileThresholdBytes: parseInt(process.env.FILE_STORAGE_LARGE_FILE_THRESHOLD_BYTES, 10) || CONFIG_DEFAULTS.fileStorage.largeFileThresholdBytes,
    multipartPartSizeBytes: parseInt(process.env.FILE_STORAGE_MULTIPART_PART_SIZE_BYTES, 10) || CONFIG_DEFAULTS.fileStorage.multipartPartSizeBytes,
    multipartQueueSize: parseInt(process.env.FILE_STORAGE_MULTIPART_QUEUE_SIZE, 10) || CONFIG_DEFAULTS.fileStorage.multipartQueueSize,
    maxBatchFiles: parseInt(process.env.FILE_STORAGE_MAX_BATCH_FILES, 10) || CONFIG_DEFAULTS.fileStorage.maxBatchFiles,
  },
  api: {
    defaultSort: process.env.API_DEFAULT_SORT ? JSON.parse(process.env.API_DEFAULT_SORT) : CONFIG_DEFAULTS.api.defaultSort,
  },
  rateLimit: {
    freeTier: parseInt(process.env.RATE_LIMIT_FREE_TIER, 10) || CONFIG_DEFAULTS.rateLimit.freeTier,
    proTier: parseInt(process.env.RATE_LIMIT_PRO_TIER, 10) || CONFIG_DEFAULTS.rateLimit.proTier,
    enterpriseTier: parseInt(process.env.RATE_LIMIT_ENTERPRISE_TIER, 10) || CONFIG_DEFAULTS.rateLimit.enterpriseTier,
    defaultTier: parseInt(process.env.RATE_LIMIT_DEFAULT_TIER, 10) || CONFIG_DEFAULTS.rateLimit.defaultTier,
    maxRequestsLimit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_LIMIT, 10) || CONFIG_DEFAULTS.rateLimit.maxRequestsLimit,
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || CONFIG_DEFAULTS.rateLimit.windowSeconds,
  },
}));

export function getAppConfig(configService: any): AppConfig {
  if (!configService) {
    console.warn('ConfigService is undefined, returning default config');
    return CONFIG_DEFAULTS;
  }

  const config = configService.get('app');
  if (!config) {
    return CONFIG_DEFAULTS;
  }

  return config;
}
