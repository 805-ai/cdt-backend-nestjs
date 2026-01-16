import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { PARTNER_ENVIRONMENT, RATE_LIMIT_TIER } from '../enums/partner.enum';

export class PartnerUpdateRequest {
  @ApiProperty({ description: 'Organization name', required: false })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  orgName?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Invalid email address' })
  contactEmail?: string;

  @ApiProperty({ description: 'Application name', required: false })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  appName?: string;

  @ApiProperty({ description: 'Callback URL (optional)', required: false })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  callbackURL?: string;

  @ApiProperty({ description: 'Environment type', required: false })
  @IsOptional()
  @IsEnum(PARTNER_ENVIRONMENT)
  environment?: PARTNER_ENVIRONMENT;

  @ApiProperty({ description: 'Rate limit tier', required: false })
  @IsOptional()
  @IsEnum(RATE_LIMIT_TIER)
  rateLimitTier?: RATE_LIMIT_TIER;

  @ApiProperty({ description: 'Webhook URL for notifications', required: false })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  webhookUrl?: string;
}
