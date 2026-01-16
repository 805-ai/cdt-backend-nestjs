import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './controllers/audit.controller';
import { AuditDAO } from './daos/audit.dao';
import { Audit, AuditSchema } from './schemas/audit.schema';
import { AuditService } from './services/audit.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }])],
  controllers: [AuditController],
  providers: [AuditService, AuditDAO],
  exports: [AuditDAO, AuditService],
})
export class AuditModule {}
