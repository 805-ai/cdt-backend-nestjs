import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { CREDENTIAL_STATUS } from '../enums/credential.enum';

export class CredentialCreateResponse extends BaseDTO {
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

  @ApiProperty({ description: 'Private secret key (shown once)' })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({ description: 'Key ID for rotation tracking' })
  @IsString()
  @IsNotEmpty()
  kid: string;

  @ApiProperty({ description: 'Credential status' })
  @IsEnum(CREDENTIAL_STATUS)
  status: CREDENTIAL_STATUS;

  @ApiProperty({ description: 'Expiration timestamp (optional)', required: false })
  @IsString()
  @IsOptional()
  expiresAt?: string;
}
