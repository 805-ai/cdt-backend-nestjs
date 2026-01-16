import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { CONSENT_PURPOSE } from '../enums/consent.enum';

export class ConsentCreateRequest {
  @ApiProperty({ description: 'User ID who is granting consent' })
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @Length(28, 128, { message: 'userId must be between 28 and 128 characters (Firebase UID)' })
  userId: string;

  @ApiProperty({ description: 'Partner/app requesting consent' })
  @IsString({ message: 'partnerId must be a string' })
  @IsNotEmpty({ message: 'partnerId is required' })
  @Length(28, 128, { message: 'partnerId must be between 28 and 128 characters (Firebase UID)' })
  partnerId: string;

  @ApiProperty({ description: 'Specific data purposes consented to' })
  @IsArray({ message: 'purposes must be an array' })
  @ArrayMinSize(1, { message: 'purposes must have at least 1 item' })
  @IsEnum(CONSENT_PURPOSE, { each: true, message: 'each purpose must be a valid CONSENT_PURPOSE value' })
  purposes: CONSENT_PURPOSE[];
}
