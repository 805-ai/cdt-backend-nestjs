import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseAdminService } from 'src/common/external/firebase/firebase-admin.service';
import { FirebaseClientService } from 'src/common/external/firebase/firebase-client.service';
import { ConsentModule } from 'src/consent/consent.module';
import { PartnerModule } from 'src/partner/partner.module';
import { UserController } from './controllers/user.controller';
import { UserDAO } from './daos/user.dao';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), forwardRef(() => PartnerModule), forwardRef(() => ConsentModule)],
  controllers: [UserController],
  providers: [UserService, UserDAO, FirebaseAdminService, FirebaseClientService],
  exports: [UserDAO, UserService],
})
export class UserModule {}
