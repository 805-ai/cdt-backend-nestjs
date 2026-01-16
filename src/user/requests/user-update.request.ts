import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class UserUpdateRequest {
  @ApiProperty({
    description: 'First name of the user',
    minLength: 2,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @Length(2, 20)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    minLength: 2,
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @Length(2, 20)
  lastName?: string;
}
