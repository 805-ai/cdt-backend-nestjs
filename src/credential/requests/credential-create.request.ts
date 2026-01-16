import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CredentialCreateRequest {
  @ApiProperty({ description: 'Linked partner identifier', required: true })
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ description: 'Expiration timestamp (optional)', required: false })
  @IsString()
  @IsOptional()
  expiresAt?: string;
}
