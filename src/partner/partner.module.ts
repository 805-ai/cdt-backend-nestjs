import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { PartnerController } from './controllers/partner.controller';
import { PartnerDAO } from './daos/partner.dao';
import { Partner, PartnerSchema } from './schemas/partner.schema';
import { PartnerService } from './services/partner.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]), forwardRef(() => UserModule)],
  controllers: [PartnerController],
  providers: [PartnerService, PartnerDAO],
  exports: [PartnerDAO, PartnerService],
})
export class PartnerModule {}
