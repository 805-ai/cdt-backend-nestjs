import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { CONSENT_PURPOSE, CONSENT_STATUS } from '../enums/consent.enum';
import { UserDTO } from '../../user/dtos/user.dto';
import { PartnerDTO } from '../../partner/dtos/partner.dto';

export class ConsentAdminResponse extends BaseDTO {
  @ApiProperty({ description: 'Unique consent identifier' })
  @IsString()
  @IsNotEmpty()
  consentId: string;

  @ApiProperty({ type: UserDTO, description: 'User who granted consent' })
  user: UserDTO;

  @ApiProperty({ type: PartnerDTO, description: 'Partner/app requesting consent' })
  partner: PartnerDTO;

  @ApiProperty({ description: 'Specific data purposes consented to' })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(CONSENT_PURPOSE, { each: true })
  purposes: CONSENT_PURPOSE[];

  @ApiProperty({ description: 'Consent status' })
  @IsEnum(CONSENT_STATUS)
  status: CONSENT_STATUS;

  @ApiProperty({ description: 'Timestamp when consent was granted' })
  @IsString()
  @IsNotEmpty()
  grantedAt: string;

  @ApiProperty({ description: 'Timestamp when consent expires' })
  @IsString()
  @IsNotEmpty()
  expiresAt: string;

  @ApiProperty({ description: 'Timestamp when consent was revoked (if applicable)' })
  @IsOptional()
  @IsString()
  revokedAt?: string;

  @ApiProperty({ description: 'Cryptographic signature for verification' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Epoch/version number for consent updates' })
  @IsNotEmpty()
  epoch: number;

  @ApiProperty({ description: 'Idempotency key for duplicate prevention' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}