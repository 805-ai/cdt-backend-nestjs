import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseDAO } from 'src/common/base/baseDAO';
import { OtpDTO } from '../dtos/otp.dto';
import { Otp, OtpDocument } from '../schemas/otp.schema';

@Injectable()
export class OtpDAO extends BaseDAO<OtpDocument, OtpDTO> {
  constructor(@InjectModel(Otp.name) otpModel: Model<OtpDocument>) {
    super(otpModel);
  }

  async findByEmailAndOtp(email: string, otp: string, used: boolean = false): Promise<OtpDTO | null> {
    const filter = { email, otp, used };
    const otps = await this.find(filter, ['*'], 1, 1);
    return otps.data.length > 0 ? otps.data[0] : null;
  }

  async findValidOtpByEmail(email: string, used: boolean = false): Promise<OtpDTO | null> {
    const filter = { email, used, expiresAt: { $gt: new Date() } };
    const otps = await this.find(filter, ['*'], 1, 1);
    return otps.data.length > 0 ? otps.data[0] : null;
  }

  async markAsUsed(id: string): Promise<OtpDTO> {
    return this.update(id, { used: true });
  }
}
