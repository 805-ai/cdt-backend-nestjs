import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const logger = new Logger('Config');

const env = process.env.NODE_ENV || 'development';
const rootPath = process.cwd();
let envPath = join(rootPath, '.env');

if (env === 'test') {
  envPath = join(rootPath, '.env.test');
} else if (env === 'staging') {
  envPath = join(rootPath, '.env.staging');
} else {
  envPath = join(rootPath, '.env');
}

if (existsSync(envPath)) {
  logger.log(`Using ${envPath} file to supply config environment variables`);
  dotenv.config({ path: envPath });
} else {
  logger.error(`No environment configuration file found for NODE_ENV=${env}. Expected file: ${envPath}`);
  process.exit(1);
}

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI_LOCAL',
  'FIREBASE_ADMIN_TYPE',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'HMAC_SECRET',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_CLIENT_ID',
  'FIREBASE_ADMIN_AUTH_URI',
  'FIREBASE_ADMIN_TOKEN_URI',
  'FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL',
  'FIREBASE_ADMIN_CLIENT_CERT_URL',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
];

const missingEnvVars = requiredEnvVars.filter((variable) => !process.env[variable]);
if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Validate private key format
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (!privateKey?.includes('-----BEGIN PRIVATE KEY-----') || !privateKey?.includes('-----END PRIVATE KEY-----')) {
  logger.error('FIREBASE_ADMIN_PRIVATE_KEY is not properly formatted. Ensure it includes BEGIN and END markers.');
  process.exit(1);
}

// Export general configuration
export const ENVIRONMENT = process.env.NODE_ENV;
export const PORT = process.env.PORT || '3000';
export const MONGODB_URI_LOCAL = process.env.MONGODB_URI_LOCAL;
export const HMAC_SECRET = process.env.HMAC_SECRET;

// Export Firebase Admin configuration
export const FIREBASE_ADMIN_CONFIG = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
};

// Export Firebase Client configuration
export const FIREBASE_CLIENT_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Export Admin configuration
export const ADMIN_CONFIG = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};
