import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import './common/config/secrets'; // Ensure secrets is imported early
import { PORT, ADMIN_CONFIG } from './common/config/secrets';
import { CustomValidationPipe } from './common/pipes/request-validate.pipe';
import { initializeFirebaseAdmin, verifyFirebaseConnection } from './common/external/firebase/firebase.init';
import { getAuth } from 'firebase-admin/auth';
import { Role } from './user/enums/role-user.enum';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  let firebaseApp;
  let firebaseEnabled = false;
  try {
    firebaseApp = initializeFirebaseAdmin();
    const isConnected = await verifyFirebaseConnection(firebaseApp);
    if (isConnected) {
      firebaseEnabled = true;
      logger.log('Firebase Admin SDK connection established');
      await createOwnerUserIfNotExists(logger);
    } else {
      logger.warn('Firebase verification failed - running in demo mode without auth');
    }
  } catch (error) {
    logger.warn(`Firebase unavailable - running in demo mode: ${error.message}`);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
    .setDescription('API documentation for the project Zobelab')
    .setVersion('1.0')
    .addTag('API')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 1,
      persistAuthorization: true,
    },
  });

  const port = PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

async function createOwnerUserIfNotExists(logger: Logger) {
  try {
    const auth = getAuth();

    try {
      const userRecord = await auth.getUserByEmail(ADMIN_CONFIG.email);
      logger.log(`Owner user already exists in Firebase: ${ADMIN_CONFIG.email}`);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    const userRecord = await auth.createUser({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password,
      displayName: 'Admin User',
      emailVerified: true,
      disabled: false,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role: Role.OWNER });

    const { UserDAO } = await import('./user/daos/user.dao');
    const { User } = await import('./user/schemas/user.schema');
    const { UserStatus } = await import('./user/enums/role-user.enum');
    const { getModelToken } = await import('@nestjs/mongoose');
    const app = await NestFactory.create(AppModule);
    const userModel = app.get(getModelToken(User.name));
    const userDAO = new UserDAO(userModel);

    await userDAO.create({
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_CONFIG.email,
      userId: userRecord.uid,
      role: Role.OWNER,
      status: UserStatus.ACTIVE,
    });

    await app.close();

    logger.log(`Owner user created successfully: ${ADMIN_CONFIG.email}`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      logger.log(`Owner user already exists: ${ADMIN_CONFIG.email}`);
    } else {
      logger.error(`Failed to create owner user: ${error.message}`, error.stack);
    }
  }
}

bootstrap();
