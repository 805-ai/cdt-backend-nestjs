import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../enums/role-user.enum';

export class PartnerSignupRequest {
  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Partner ID' })
  @IsMongoId()
  @IsNotEmpty()
  partnerId: string;
}
