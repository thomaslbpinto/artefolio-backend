import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { EmailService } from '../../email/email.service';
import { OtpCodeService } from '../../otp-code/otp-code.service';
import { UserEntity } from 'src/core/entities/user.entity';
import { assertTokenExists, assertTokenNotExpired } from 'src/core/utils/token.util';
import { compareOtpCode, generateOtpCode, hashOtpCode } from 'src/core/utils/otp-code.util';
import { OTP_CODE_LENGTH, OTP_CODE_RESEND_COOLDOWN_IN_SECONDS } from 'src/core/constants/otp-code.constant';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';
import { ResendCooldownDto } from 'src/core/dtos/auth/resend-cooldown.dto';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpCodeService: OtpCodeService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmailVerificationEmail(user: UserEntity): Promise<void> {
    const userId = user.id;
    const code = generateOtpCode(OTP_CODE_LENGTH);
    const codeHash = await hashOtpCode(code);

    await this.otpCodeService.deleteByUserId(userId, OtpPurpose.EMAIL_VERIFICATION);
    await this.otpCodeService.create(userId, codeHash, OtpPurpose.EMAIL_VERIFICATION);
    await this.emailService.sendEmailVerificationEmail(user.email, user.name, code);
  }

  async getResendCooldown(userId: number): Promise<ResendCooldownDto> {
    const existing = await this.otpCodeService.findByUserId(userId, OtpPurpose.EMAIL_VERIFICATION);

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

    const existing = await this.otpCodeService.findByUserId(user.id, OtpPurpose.EMAIL_VERIFICATION);

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

    const emailVerificationOtpCode = await this.otpCodeService.findByUserId(userId, OtpPurpose.EMAIL_VERIFICATION);

    assertTokenExists(emailVerificationOtpCode, 'Invalid email verification code.');
    await assertTokenNotExpired(emailVerificationOtpCode, 'Email verification code expired.', async () => {
      await this.otpCodeService.deleteByUserId(userId, OtpPurpose.EMAIL_VERIFICATION);
    });

    if (!(await compareOtpCode(code, emailVerificationOtpCode.codeHash))) {
      throw new BadRequestException('Invalid email verification code.');
    }

    await this.otpCodeService.deleteByUserId(userId, OtpPurpose.EMAIL_VERIFICATION);
    await this.userRepository.update(userId, { emailVerified: true });
  }
}
