import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO } from 'src/common/base/baseDAO';
import { AuditDTO } from '../dtos/audit.dto';
import { Audit, AuditDocument } from '../schemas/audit.schema';

@Injectable()
export class AuditDAO extends BaseDAO<AuditDocument, AuditDTO> {
  constructor(@InjectModel(Audit.name) auditModel: Model<AuditDocument>) {
    super(auditModel);
  }

  async findByAction(action: string): Promise<AuditDTO | null> {
    const audits = await this.find({ action }, ['*'], 1, 1);
    return audits.data.length > 0 ? audits.data[0] : null;
  }
}
