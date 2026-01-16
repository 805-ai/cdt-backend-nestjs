import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { PARTNER_ENVIRONMENT, PARTNER_STATUS, RATE_LIMIT_TIER, SCOPE } from '../enums/partner.enum';

export class PartnerDTO extends BaseDTO {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  orgName: string;

  @ApiProperty({ description: 'Contact email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  contactEmail: string;

  @ApiProperty({ description: 'Application name' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  appName: string;

  @ApiProperty({ description: 'Callback URL (optional)' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  callbackURL?: string;

  @ApiProperty({ description: 'Environment type' })
  @IsEnum(PARTNER_ENVIRONMENT)
  environment: PARTNER_ENVIRONMENT;

  @ApiProperty({ description: 'Requested scopes' })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SCOPE, { each: true })
  scopesRequested: SCOPE[];

  @ApiProperty({ description: 'Rate limit tier' })
  @IsEnum(RATE_LIMIT_TIER)
  rateLimitTier: RATE_LIMIT_TIER;

  @ApiProperty({ description: 'Partner status' })
  @IsEnum(PARTNER_STATUS)
  status: PARTNER_STATUS;

  @ApiProperty({ description: 'Webhook URL for notifications' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  webhookUrl?: string;

  @ApiProperty({ description: 'Owner user ID', required: false })
  @IsOptional()
  @IsString()
  ownerUserId?: string;
}
