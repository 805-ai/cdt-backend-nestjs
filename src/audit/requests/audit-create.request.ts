import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { AuditAction, AuditStatus } from '../enums/audit.enum';

export class AuditCreateRequest {
  @ApiProperty({ description: 'Type of audit action' })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @ApiProperty({ description: 'User who performed the action' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Associated partner identifier' })
  @IsString()
  @IsOptional()
  partnerId?: string;

  @ApiProperty({ description: 'Associated consent ID' })
  @IsString()
  @IsOptional()
  consentId?: string;

  @ApiProperty({ description: 'Timestamp of action' })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({ description: 'Action details' })
  @IsString()
  @IsNotEmpty()
  details: string;

  @ApiProperty({ description: 'Client IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({ description: 'Status of the audit action', enum: AuditStatus })
  @IsEnum(AuditStatus)
  @IsNotEmpty()
  status: AuditStatus;

  @ApiProperty({ description: 'Additional metadata for the action' })
  @IsOptional()
  metadata?: any;
}
