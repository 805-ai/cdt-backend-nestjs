import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AuditStatus } from '../enums/audit.enum';

export class AuditUpdateRequest {
  @ApiProperty({ description: 'Status of the audit action', enum: AuditStatus })
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @ApiProperty({ description: 'Action details' })
  @IsString()
  @IsOptional()
  details?: string;
}
