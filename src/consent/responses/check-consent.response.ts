import { ApiProperty } from '@nestjs/swagger';

export class CheckConsentResponse {
  @ApiProperty({ description: 'Whether user exists in CDT system', example: true })
  isUserCreated: boolean;

  @ApiProperty({ description: 'Whether user has valid consent for this partner', example: true })
  isConsentValid: boolean;

  @ApiProperty({ description: 'Whether existing consent is expired', example: false })
  isConsentExpired: boolean;
}
