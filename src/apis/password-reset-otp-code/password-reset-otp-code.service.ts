import { Injectable } from '@nestjs/common';
import { OtpCodeRepository } from '../otp-code/otp-code.repository';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';
import { OtpCodeEntity } from 'src/core/entities/otp-code.entity';
import { OTP_CODE_EXPIRATION_IN_MINUTES } from 'src/core/constants/otp-code.constant';
import { generateExpirationInMinutes } from 'src/core/utils/expiration.util';

@Injectable()
export class PasswordResetOtpCodeService {
  constructor(private readonly otpCodeRepository: OtpCodeRepository) {}

  private readonly purpose = OtpPurpose.PASSWORD_RESET;

  async create(userId: number, codeHash: string): Promise<OtpCodeEntity> {
    const expiresAt = generateExpirationInMinutes(OTP_CODE_EXPIRATION_IN_MINUTES);

    return this.otpCodeRepository.create(userId, codeHash, expiresAt, this.purpose);
  }

  async findByUserId(userId: number): Promise<OtpCodeEntity | null> {
    return this.otpCodeRepository.findByUserIdAndPurpose(userId, this.purpose);
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.otpCodeRepository.deleteByUserIdAndPurpose(userId, this.purpose);
  }
}
