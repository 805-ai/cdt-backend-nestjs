import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { BaseDTO } from '../../common/base/base.dto';
import { Role, UserStatus } from '../enums/role-user.enum';

export class UserCreateResponse extends BaseDTO {
  @ApiProperty({ example: 'John', minLength: 2, maxLength: 20 })
  @IsNotEmpty()
  @Length(2, 20)
  firstName: string;

  @ApiProperty({ example: 'Doe', minLength: 2, maxLength: 20 })
  @IsNotEmpty()
  @Length(2, 20)
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Must be a valid email format',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  @Matches(/^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, {
    message: 'Invalid email address format',
  })
  email: string;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Account status',
    enum: UserStatus,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({
    example: [Role.USER],
    isArray: true,
    enum: Role,
    description: 'List of roles assigned to the user',
  })
  @IsArray()
  @IsEnum(Role, { each: true, message: 'Invalid role' })
  roles: Role[];

  @ApiProperty({
    example: 'FpqqfaTsQYXcOszHZRPXk9K1ycT2',
    description: 'Firebase user ID',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
