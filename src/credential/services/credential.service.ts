import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto'; // Use full import for clarity
import { PaginatedData } from 'src/common/base/baseDAO';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { PartnerService } from 'src/partner/services/partner.service';
import { CredentialDAO } from '../daos/credential.dao';
import { CredentialDTO } from '../dtos/credential.dto';
import { CREDENTIAL_STATUS } from '../enums/credential.enum';
import { CredentialCreateRequest } from '../requests/credential-create.request';
import { CredentialCreateResponse } from '../responses/credential-create.response';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);

  constructor(private readonly credentialDAO: CredentialDAO, private readonly partnerService: PartnerService) {}

  async createCredential(data: CredentialCreateRequest): Promise<CredentialCreateResponse> {
    const partner = await this.partnerService.getPartnerById(data.partnerId);
    if (!partner) throw new CustomError('Partner not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.PARTNER, ApiErrorSubCode.NOT_FOUND);

    const credentialId = `cred_${crypto.randomUUID().replace(/-/g, '')}`;
    const clientId = `client_${crypto.randomUUID().replace(/-/g, '')}`;
    const kid = `key-v1-${Date.now()}`; // Versioned key ID for rotation (bump v on new create)

    // Secure secret gen: 32 bytes (256-bit) CSPRNG random, hex-encoded (64 chars)
    const secret = crypto.randomBytes(32).toString('hex');
    // Optional: Derive with env salt for extra sophistication (if env set)
    const salt = process.env.CREDENTIAL_SALT || crypto.randomBytes(16).toString('hex');
    const derivedSecret = crypto.createHmac('sha256', salt).update(secret).digest('hex').substring(0, 64);

    // Default 90-day expiry, optional override via request
    const expiresAt = data.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const createdCredential = await this.credentialDAO.create({
      credentialId,
      partnerId: data.partnerId,
      clientId,
      kid,
      secret: derivedSecret,
      status: CREDENTIAL_STATUS.ACTIVE,
      expiresAt,
    });

    return {
      id: createdCredential.id,
      createdAt: createdCredential.createdAt,
      updatedAt: createdCredential.updatedAt,
      credentialId: createdCredential.credentialId,
      partnerId: createdCredential.partnerId,
      clientId: createdCredential.clientId,
      kid: createdCredential.kid,
      secret: createdCredential.secret, // Note: Only shown once in response
      status: createdCredential.status,
      expiresAt: createdCredential.expiresAt, // Now valid in response
    };
  }

  async getCredentialById(id: string): Promise<CredentialDTO> {
    const credential = await this.credentialDAO.findById(id);
    if (!credential) throw new CustomError('Credential not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    // Always hide secret after creation (security best practice)
    return { ...credential, secret: undefined };
  }

  async getAllCredentials(page: number, perPage: number, search?: string, status?: string): Promise<PaginatedData<CredentialDTO>> {
    const filter: any = {};
    if (search) filter.$or = [{ credentialId: { $regex: search, $options: 'i' } }, { clientId: { $regex: search, $options: 'i' } }];
    if (status) filter.status = status;
    return this.credentialDAO.find(filter, ['*'], page, perPage);
  }

  async revokeCredential(id: string): Promise<CredentialDTO> {
    const credential = await this.credentialDAO.findById(id);
    if (!credential) throw new CustomError('Credential not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    if (credential.status === CREDENTIAL_STATUS.REVOKED)
      throw new CustomError('Credential already revoked.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.ALREADY_EXISTS);
    // Check expiry before revoke (optional robustness)
    if (credential.expiresAt && new Date() > new Date(credential.expiresAt)) {
      throw new CustomError('Credential already expired.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.ALREADY_EXISTS);
    }
    return this.credentialDAO.update(id, { status: CREDENTIAL_STATUS.REVOKED, revokedAt: new Date().toISOString() });
  }

  async reissueCredential(id: string): Promise<CredentialCreateResponse> {
    const credential = await this.credentialDAO.findById(id);
    if (!credential) throw new CustomError('Credential not found.', HttpStatusCode.NOT_FOUND, ApiErrorCode.USER, ApiErrorSubCode.NOT_FOUND);
    if (credential.status === CREDENTIAL_STATUS.REVOKED)
      throw new CustomError('Cannot reissue revoked credential.', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    // Soft revoke existing
    await this.revokeCredential(id);
    // Create new with bumped version (e.g., key-v2-...)
    const newKid = `key-v${parseInt(credential.kid.split('-')[1]) + 1}-${Date.now()}`;
    const newCredentialData: CredentialCreateRequest = { partnerId: credential.partnerId };
    const newCredential = await this.createCredential(newCredentialData);
    newCredential.kid = newKid; // Override with new version
    await this.credentialDAO.update(newCredential.id, { kid: newKid });
    return newCredential;
  }
}
