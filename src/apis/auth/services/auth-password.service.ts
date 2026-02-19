import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { EmailService } from '../../email/email.service';
import { OtpCodeService } from '../../otp-code/otp-code.service';
import { RefreshTokenRepository } from '../../refresh-token/refresh-token.repository';
import { assertTokenExists, assertTokenNotExpired } from 'src/core/utils/token.util';
import { compareOtpCode, generateOtpCode, hashOtpCode } from 'src/core/utils/otp-code.util';
import { OTP_CODE_LENGTH, OTP_CODE_RESEND_COOLDOWN_IN_SECONDS } from 'src/core/constants/otp-code.constant';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';
import { ResendCooldownDto } from 'src/core/dtos/auth/resend-cooldown.dto';

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly otpCodeService: OtpCodeService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async getResendCooldown(email: string): Promise<ResendCooldownDto> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return { retryAfterSeconds: 0 };
    }

    const existing = await this.otpCodeService.findByUserId(user.id, OtpPurpose.PASSWORD_RESET);

    if (!existing) {
      return { retryAfterSeconds: 0 };
    }

    const secondsElapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
    const retryAfterSeconds = Math.max(0, Math.ceil(OTP_CODE_RESEND_COOLDOWN_IN_SECONDS - secondsElapsed));

    return { retryAfterSeconds };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return;
    }

    if (!user.passwordHash && user.googleId) {
      throw new BadRequestException('This account was created using Google. Please sign in with Google instead.');
    }

    const userId = user.id;
    const existing = await this.otpCodeService.findByUserId(userId, OtpPurpose.PASSWORD_RESET);

    if (existing) {
      const secondsElapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
      const retryAfterSeconds = Math.ceil(OTP_CODE_RESEND_COOLDOWN_IN_SECONDS - secondsElapsed);

      if (retryAfterSeconds > 0) {
        throw new HttpException(
          { message: 'Please wait before requesting a new code.', retryAfterSeconds },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const code = generateOtpCode(OTP_CODE_LENGTH);
    const codeHash = await hashOtpCode(code);

    await this.otpCodeService.deleteByUserId(userId, OtpPurpose.PASSWORD_RESET);
    await this.otpCodeService.create(userId, codeHash, OtpPurpose.PASSWORD_RESET);
    await this.emailService.sendPasswordResetEmail(user.email, user.name, code);
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid password reset code.');
    }

    const userId = user.id;
    const passwordResetOtpCode = await this.otpCodeService.findByUserId(userId, OtpPurpose.PASSWORD_RESET);

    assertTokenExists(passwordResetOtpCode, 'Invalid password reset code.');
    await assertTokenNotExpired(passwordResetOtpCode, 'Password reset code expired.', async () => {
      await this.otpCodeService.deleteByUserId(userId, OtpPurpose.PASSWORD_RESET);
    });

    if (!(await compareOtpCode(code, passwordResetOtpCode.codeHash))) {
      throw new BadRequestException('Invalid password reset code.');
    }

    return user;
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.verifyPasswordResetCode(email, code);
    const userId = user.id;

    await this.otpCodeService.deleteByUserId(userId, OtpPurpose.PASSWORD_RESET);
    await this.refreshTokenRepository.deleteByUserId(userId);
    await this.userRepository.update(userId, { password: newPassword });
  }
}
