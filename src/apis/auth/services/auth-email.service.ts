import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { EmailService } from '../../email/email.service';
import { EmailVerificationOtpCodeService } from '../../email-verification-otp-code/email-verifcation-otp-code.service';
import { UserEntity } from 'src/core/entities/user.entity';
import { assertTokenExists, assertTokenNotExpired } from 'src/core/utils/token.util';
import { compareOtpCode, generateOtpCode, hashOtpCode } from 'src/core/utils/otp-code.util';
import { OTP_CODE_RESEND_COOLDOWN_IN_SECONDS } from 'src/core/constants/otp-code.constant';
import { ResendCooldownEmailDto } from 'src/core/dtos/auth/email/resend-cooldown-email.dto';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationOtpCodeService: EmailVerificationOtpCodeService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmailVerificationEmail(user: UserEntity): Promise<void> {
    const userId = user.id;
    const code = generateOtpCode(6);
    const codeHash = await hashOtpCode(code);

    await this.emailVerificationOtpCodeService.deleteByUserId(userId);
    await this.emailVerificationOtpCodeService.create(userId, codeHash);
    await this.emailService.sendEmailVerificationEmail(user.email, user.name, code);
  }

  async getResendCooldown(userId: number): Promise<ResendCooldownEmailDto> {
    const existing = await this.emailVerificationOtpCodeService.findByUserId(userId);

    if (!existing) {
      return { retryAfterSeconds: 0 };
    }

    const secondsElapsed = (Date.now() - existing.createdAt.getTime()) / 1000;
    const retryAfterSeconds = Math.max(0, Math.ceil(OTP_CODE_RESEND_COOLDOWN_IN_SECONDS - secondsElapsed));

    return { retryAfterSeconds };
  }

  async resendEmailVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified.');
    }

    if (user.googleId) {
      throw new BadRequestException('Google accounts are verified by default.');
    }

    const existing = await this.emailVerificationOtpCodeService.findByUserId(user.id);

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

    await this.sendEmailVerificationEmail(user);
  }

  async verifyEmailVerificationCode(user: UserEntity, code: string): Promise<void> {
    const userId = user.id;

    if (user.emailVerified) {
      return;
    }

    const emailVerificationOtpCode = await this.emailVerificationOtpCodeService.findByUserId(userId);

    assertTokenExists(emailVerificationOtpCode, 'Invalid email verification code.');
    assertTokenNotExpired(emailVerificationOtpCode, 'Email verification code expired.', async () => {
      await this.emailVerificationOtpCodeService.deleteByUserId(userId);
    });

    if (!(await compareOtpCode(code, emailVerificationOtpCode.codeHash))) {
      throw new BadRequestException('Invalid email verification code.');
    }

    await this.emailVerificationOtpCodeService.deleteByUserId(userId);
    await this.userRepository.update(userId, { emailVerified: true });
  }
}
