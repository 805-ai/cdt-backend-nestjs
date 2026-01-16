import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsentController } from './controllers/consent.controller';
import { ConsentDAO } from './daos/consent.dao';
import { Consent, ConsentSchema } from './schemas/consent.schema';
import { ConsentService } from './services/consent.service';
import { PartnerModule } from 'src/partner/partner.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Consent.name, schema: ConsentSchema }]), AuditModule, PartnerModule, forwardRef(() => ConsentModule)],
  controllers: [ConsentController],
  providers: [ConsentService, ConsentDAO],
  exports: [ConsentDAO, ConsentService],
})
export class ConsentModule {}
