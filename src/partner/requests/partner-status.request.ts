import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PARTNER_STATUS } from '../enums/partner.enum';

export class GetPartnersByStatusRequest {
  @ApiProperty({ 
    description: 'Partner status to filter by',
    enum: PARTNER_STATUS,
    example: PARTNER_STATUS.PENDING
  })
  @IsEnum(PARTNER_STATUS)
  @IsNotEmpty()
  status: PARTNER_STATUS;
}