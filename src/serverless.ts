import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';
import './common/config/secrets';
import { CustomValidationPipe } from './common/pipes/request-validate.pipe';
import { initializeFirebaseAdmin, verifyFirebaseConnection } from './common/external/firebase/firebase.init';

const server = express();
const logger = new Logger('Serverless');

let cachedApp: NestExpressApplication | null = null;

async function bootstrap(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  // Initialize Firebase (optional)
  try {
    const firebaseApp = initializeFirebaseAdmin();
    if (firebaseApp) {
      const isConnected = await verifyFirebaseConnection(firebaseApp);
      if (isConnected) {
        logger.log('Firebase Admin SDK connection established');
      } else {
        logger.warn('Firebase verification failed - running in demo mode');
      }
    }
  } catch (error) {
    logger.warn(`Firebase unavailable - running in demo mode: ${error.message}`);
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  app.useStaticAssets(join(__dirname, '..', 'views'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('html');

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new CustomValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CDT Docs')
    .setDescription('API documentation for CDT Backend')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.init();
  cachedApp = app;

  logger.log('NestJS serverless handler initialized');
  return app;
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
