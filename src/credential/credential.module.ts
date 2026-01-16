import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerModule } from 'src/partner/partner.module';
import { CredentialController } from './controllers/credential.controller';
import { CredentialDAO } from './daos/credential.dao';
import { Credential, CredentialSchema } from './schemas/credential.schema';
import { CredentialService } from './services/credential.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Credential.name, schema: CredentialSchema }]), PartnerModule],
  controllers: [CredentialController],
  providers: [CredentialService, CredentialDAO],
  exports: [CredentialDAO, CredentialService],
})
export class CredentialModule {}
