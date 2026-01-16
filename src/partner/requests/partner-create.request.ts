import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl, Length, MaxLength } from 'class-validator';
import { PARTNER_ENVIRONMENT, RATE_LIMIT_TIER, SCOPE } from '../enums/partner.enum';

export class PartnerCreateRequest {
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

  @ApiProperty({ description: 'Webhook URL for notifications' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  webhookUrl?: string;

  @ApiProperty({ description: 'Owner user ID' })
  @IsNotEmpty()
  @IsString()
  ownerUserId: string;
}
