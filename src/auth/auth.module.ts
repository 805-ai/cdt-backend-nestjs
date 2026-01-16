import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseClientService } from 'src/common/external/firebase/firebase-client.service';
import { UserModule } from 'src/user/user.module';
import { FirebaseAdminService } from '../common/external/firebase/firebase-admin.service';
import { AuthController } from './controllers/auth.controller';
import { OtpDAO } from './daos/otp.dao';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { AuthService } from './services/auth.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]), UserModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService, FirebaseClientService, OtpDAO],
})
export class AuthModule {}
