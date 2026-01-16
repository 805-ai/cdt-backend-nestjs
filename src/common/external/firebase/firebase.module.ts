import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirebaseClientService } from './firebase-client.service';

@Module({
  providers: [FirebaseAdminService, FirebaseClientService],
  exports: [FirebaseAdminService, FirebaseClientService],
})
export class FirebaseModule {}
