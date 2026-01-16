import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { Role, UserStatus } from '../enums/role-user.enum';

export class UserDTO extends BaseDTO {
  @ApiProperty({ description: 'Unique user identifier' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'First name of the user', minLength: 2, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', minLength: 2, maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  lastName: string;

  @ApiProperty({ description: 'partner id of the user', minLength: 2, maxLength: 20 })
  @IsString()
  @IsOptional()
  partnerId?: string;

  @ApiProperty({ description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'User role' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: 'Account status' })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  @IsString()
  @IsOptional()
  lastLoginAt?: string;
}
