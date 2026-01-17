import { Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { MONGODB_URI_LOCAL } from './common/config/secrets';
import { ResultInterceptor } from './common/interceptors/result.interceptor';
import { SharedAuthModule } from './common/shared/shared.module';
import { ConsentModule } from './consent/consent.module';
import { CredentialModule } from './credential/credential.module';
import { PartnerModule } from './partner/partner.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { UserModule } from './user/user.module';

const logger = new Logger('AppModule');

// Build imports array conditionally
const imports: any[] = [
  ConfigModule.forRoot({ isGlobal: true }),
];

// Only add MongoDB if URI is configured
if (MONGODB_URI_LOCAL) {
  imports.push(MongooseModule.forRoot(MONGODB_URI_LOCAL));
  imports.push(UserModule);
  imports.push(AuthModule);
  imports.push(CredentialModule);
  imports.push(AuditModule);
  imports.push(PartnerModule);
  imports.push(RateLimitModule);
  imports.push(ConsentModule);
  imports.push(SharedAuthModule);
  logger.log('MongoDB configured - full functionality enabled');
} else {
  logger.warn('MONGODB_URI_LOCAL not set - running in demo mode without database');
}

@Module({
  imports,
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
  ],
})
export class AppModule {}
