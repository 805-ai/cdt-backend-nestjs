import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { CREDENTIAL_STATUS } from '../enums/credential.enum';

export class CredentialDTO extends BaseDTO {
  @ApiProperty({ description: 'Unique credential identifier' })
  @IsString()
  @IsNotEmpty()
  credentialId: string;

  @ApiProperty({ description: 'Linked partner identifier' })
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ description: 'Public client ID for API access' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Private secret key (hidden after creation)', required: false })
  @IsString()
  @IsOptional()
  secret?: string; // Optional, hidden post-create, no @IsNotEmpty() to allow undefined

  @ApiProperty({ description: 'Key ID for rotation tracking' })
  @IsString()
  @IsNotEmpty()
  kid: string; // For rotation

  @ApiProperty({ description: 'Credential status' })
  @IsEnum(CREDENTIAL_STATUS)
  status: CREDENTIAL_STATUS;

  @ApiProperty({ description: 'Revocation timestamp (optional)', required: false })
  @IsString()
  @IsOptional()
  revokedAt?: string;

  @ApiProperty({ description: 'Expiration timestamp (optional)', required: false })
  @IsString()
  @IsOptional()
  expiresAt?: string; // New: Matches schema/service for expiry
}
