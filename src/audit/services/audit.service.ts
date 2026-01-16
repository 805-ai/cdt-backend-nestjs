import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { AuditDAO } from '../daos/audit.dao';
import { AuditDTO } from '../dtos/audit.dto';
import { AuditCreateRequest } from '../requests/audit-create.request';
import { AuditUpdateRequest } from '../requests/audit-update.request';
import { AuditCreateResponse } from '../responses/audit-create.response';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditDAO: AuditDAO) {}

  async createAudit(data: AuditCreateRequest & { metadata?: any }, req?: Request): Promise<AuditCreateResponse> {
    const auditData = {
      ...data,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    const createdAudit = await this.auditDAO.create(auditData);

    return {
      id: createdAudit.id,
      createdAt: createdAudit.createdAt,
      updatedAt: createdAudit.updatedAt,
      action: createdAudit.action,
      userId: createdAudit.userId,
      partnerId: createdAudit.partnerId,
      consentId: createdAudit.consentId,
      timestamp: createdAudit.timestamp,
      details: createdAudit.details,
      ipAddress: createdAudit.ipAddress,
      userAgent: createdAudit.userAgent,
      status: createdAudit.status,
      metadata: createdAudit.metadata,
    };
  }

  async getAuditById(id: string): Promise<AuditDTO> {
    const audit = await this.auditDAO.findById(id);
    if (!audit) throw new CustomError('Audit not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    return audit;
  }

  async getAllAudits(page: number, perPage: number, search?: string, action?: string): Promise<PaginatedData<AuditDTO>> {
    const filter: any = {};
    if (search) filter.$or = [{ details: { $regex: search, $options: 'i' } }, { userId: { $regex: search, $options: 'i' } }];
    if (action) filter.action = action;
    return this.auditDAO.find(filter, ['*'], page, perPage);
  }

  async updateAudit(id: string, data: AuditUpdateRequest): Promise<AuditDTO> {
    const audit = await this.auditDAO.findById(id);
    if (!audit) throw new CustomError('Audit not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    return this.auditDAO.update(id, data);
  }
}
