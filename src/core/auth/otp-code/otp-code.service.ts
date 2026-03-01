import { Injectable } from '@nestjs/common';
import { OtpCodeRepository } from './otp-code.repository';
import { OtpCodeEntity } from 'src/core/entities/otp-code.entity';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';
import { OTP_CODE_EXPIRATION_IN_MINUTES } from 'src/core/constants/otp-code.constant';
import { generateExpirationInMinutes } from 'src/core/utils/expiration.util';

@Injectable()
export class OtpCodeService {
  constructor(private readonly otpCodeRepository: OtpCodeRepository) {}

  async create(userId: number, codeHash: string, purpose: OtpPurpose): Promise<OtpCodeEntity> {
    const expiresAt = generateExpirationInMinutes(OTP_CODE_EXPIRATION_IN_MINUTES);
    return this.otpCodeRepository.create(userId, codeHash, expiresAt, purpose);
  }

  async findByUserId(userId: number, purpose: OtpPurpose): Promise<OtpCodeEntity | null> {
    return this.otpCodeRepository.findByUserIdAndPurpose(userId, purpose);
  }

  async deleteByUserId(userId: number, purpose: OtpPurpose): Promise<void> {
    await this.otpCodeRepository.deleteByUserIdAndPurpose(userId, purpose);
  }
}
