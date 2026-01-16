import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { UserDTO } from '../../user/dtos/user.dto';
import { PARTNER_ENVIRONMENT, PARTNER_STATUS, SCOPE } from '../enums/partner.enum';

export class PartnerCreateResponse extends BaseDTO {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @IsNotEmpty()
  orgName: string;

  @ApiProperty({ description: 'Contact email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  contactEmail: string;

  @ApiProperty({ description: 'Application name' })
  @IsString()
  @IsNotEmpty()
  appName: string;

  @ApiProperty({ description: 'Partner status' })
  @IsEnum(PARTNER_STATUS)
  status: PARTNER_STATUS;

  @ApiProperty({ description: 'Environment type' })
  @IsEnum(PARTNER_ENVIRONMENT)
  environment: PARTNER_ENVIRONMENT;

  @ApiProperty({ description: 'Requested scopes' })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(SCOPE, { each: true })
  scopesRequested: SCOPE[];

  @ApiProperty({ type: UserDTO, description: 'Owner user' })
  ownerUser: UserDTO;
}
