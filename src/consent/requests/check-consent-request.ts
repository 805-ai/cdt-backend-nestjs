import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CheckConsentRequest {
  @ApiProperty({ description: 'User email to check' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Partner ID for consent check' })
  @IsString()
  partnerId: string;
}
