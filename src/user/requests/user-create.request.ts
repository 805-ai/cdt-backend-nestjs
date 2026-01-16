import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { Role } from '../enums/role-user.enum';

export class UserCreateRequest {
  @ApiProperty({
    description: 'First name of the user',
    minLength: 2,
    maxLength: 20,
  })
  @IsNotEmpty()
  @Length(2, 20)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    minLength: 2,
    maxLength: 20,
  })
  @IsNotEmpty()
  @Length(2, 20)
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  @Matches(/^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/, {
    message: 'Invalid email address format',
  })
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    minLength: 8,
    maxLength: 20,
  })
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    default: Role.USER,
  })
  @IsNotEmpty()
  role: Role;
}
