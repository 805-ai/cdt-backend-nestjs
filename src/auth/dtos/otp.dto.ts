import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from 'src/common/base/base.dto';

export class OtpDTO extends BaseDTO {
  @ApiProperty({ description: 'Email address for OTP' })
  email: string;

  @ApiProperty({ description: 'OTP code' })
  otp: string;

  @ApiProperty({ description: 'Expiration timestamp' })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether OTP has been used' })
  used: boolean;
}
