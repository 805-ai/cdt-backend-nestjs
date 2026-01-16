import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CONSENT_STATUS } from '../enums/consent.enum';

export class ConsentUpdateRequest {
  @ApiProperty({ description: 'New status (optional)' })
  @IsOptional()
  @IsEnum(CONSENT_STATUS)
  status?: CONSENT_STATUS;
}
