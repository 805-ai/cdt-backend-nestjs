import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PARTNER_STATUS } from '../enums/partner.enum';

export class UpdatePartnerStatusRequest {
  @ApiProperty({ 
    description: 'New status for partner',
    enum: [PARTNER_STATUS.APPROVED, PARTNER_STATUS.REJECTED, PARTNER_STATUS.ACTIVE, PARTNER_STATUS.DEACTIVATED]
  })
  @IsEnum(PARTNER_STATUS)
  @IsNotEmpty()
  status: PARTNER_STATUS.APPROVED | PARTNER_STATUS.REJECTED | PARTNER_STATUS.ACTIVE | PARTNER_STATUS.DEACTIVATED;
}