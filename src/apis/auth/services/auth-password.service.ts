import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from '../../user/user.repository';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { EmailService } from '../../email/email.service';
import { PasswordResetOtpCodeService } from '../../password-reset-otp-code/password-reset-otp-code.service';
import { RefreshTokenRepository } from '../../refresh-token/refresh-token.repository';
import { assertTokenExists, assertTokenNotExpired } from 'src/core/utils/token.util';
import { compareOtpCode, generateOtpCode, hashOtpCode } from 'src/core/utils/otp-code.util';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { OTP_CODE_RESEND_COOLDOWN_IN_SECONDS } from 'src/core/constants/otp-code.constant';
import { ResendCooldownResetPasswordDto } from 'src/core/dtos/auth/password/resend-cooldown-reset-password.dto';

@Injectable()
export class AuthPasswordService {
  constructor(
    private readonly passwordResetOtpCodeService: PasswordResetOtpCodeService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async getResendCooldown(email: string): Promise<ResendCooldownResetPasswordDto> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return { retryAfterSeconds: 0 };
    }

    const existing = await this.passwordResetOtpCodeService.findByUserId(user.id);

    if (!existing) {
      return { retryAfterSeconds: 0 };
    }

    const secondsElapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
    const retryAfterSeconds = Math.max(0, Math.ceil(OTP_CODE_RESEND_COOLDOWN_IN_SECONDS - secondsElapsed));

    return { retryAfterSeconds };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return;
    }

    const userId = user.id;
    const existing = await this.passwordResetOtpCodeService.findByUserId(userId);

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

    const code = generateOtpCode(6);
    const codeHash = await hashOtpCode(code);

    await this.passwordResetOtpCodeService.deleteByUserId(userId);
    await this.passwordResetOtpCodeService.create(userId, codeHash);
    await this.emailService.sendPasswordResetEmail(user.email, user.name, code);
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid password reset code.');
    }

    const userId = user.id;
    const passwordResetOtpCode = await this.passwordResetOtpCodeService.findByUserId(userId);

    assertTokenExists(passwordResetOtpCode, 'Invalid password reset code.');
    assertTokenNotExpired(passwordResetOtpCode, 'Password reset code expired.', async () => {
      await this.passwordResetOtpCodeService.deleteByUserId(userId);
    });

    if (!(await compareOtpCode(code, passwordResetOtpCode.codeHash))) {
      throw new BadRequestException('Invalid password reset code.');
    }

    return plainToInstance(UserResponseDto, user, CLASS_TRANSFORMER_OPTIONS);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.verifyPasswordResetCode(email, code);
    const userId = user.id;

    await this.passwordResetOtpCodeService.deleteByUserId(userId);
    await this.refreshTokenRepository.deleteByUserId(userId);
    await this.userRepository.update(userId, { password: newPassword });
  }
}
