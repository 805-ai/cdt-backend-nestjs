import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CREDENTIAL_STATUS } from '../enums/credential.enum';

export class CredentialUpdateRequest {
  @ApiProperty({ description: 'New status (optional)', enum: CREDENTIAL_STATUS })
  @IsOptional()
  @IsEnum(CREDENTIAL_STATUS)
  status?: CREDENTIAL_STATUS;
}
