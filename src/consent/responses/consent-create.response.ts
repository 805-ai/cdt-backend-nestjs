import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { CONSENT_PURPOSE, CONSENT_STATUS } from '../enums/consent.enum';

export class ConsentCreateResponse extends BaseDTO {
  @ApiProperty({ description: 'Unique consent identifier' })
  @IsString()
  @IsNotEmpty()
  consentId: string;

  @ApiProperty({ description: 'User who granted consent' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Partner/app requesting consent' })
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({ description: 'Specific data purposes consented to' })
  @IsArray()
  @IsNotEmpty()
  @IsEnum(CONSENT_PURPOSE, { each: true })
  purposes: CONSENT_PURPOSE[];

  @ApiProperty({ description: 'Current consent status' })
  @IsEnum(CONSENT_STATUS)
  status: CONSENT_STATUS;

  @ApiProperty({ description: 'HMAC signature for integrity' })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
