import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../user/user.repository';
import { SignInDto } from 'src/core/dtos/auth/sign/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign/sign-up.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { comparePassword, hashPassword } from 'src/core/utils/password.util';
import { AuthSessionService } from './auth-session.service';
import { PendingGoogleService } from './pending-google.service';
import { clearAuthCookies, getRefreshTokenFromCookie } from 'src/core/helpers/auth-cookie.helper';
import { RefreshTokenRepository } from 'src/apis/refresh-token/refresh-token.repository';
import { Response, Request } from 'express';
import { AuthEmailService } from './auth-email.service';
import { OTP_CODE_EXPIRATION_IN_MINUTES } from 'src/core/constants/otp-code.constant';
import { OtpCodeEntity } from 'src/core/entities/otp-code.entity';
import { UserEntity } from 'src/core/entities/user.entity';
import { OtpPurpose } from 'src/core/enums/otp-purpose.enum';
import { generateExpirationInMinutes } from 'src/core/utils/expiration.util';
import { generateOtpCode, hashOtpCode } from 'src/core/utils/otp-code.util';
import { DataSource } from 'typeorm';
import { EmailService } from 'src/apis/email/email.service';

@Injectable()
export class AuthSignService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly authSessionService: AuthSessionService,
    private readonly pendingGoogleService: PendingGoogleService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly authEmailService: AuthEmailService,
    private readonly dataSource: DataSource,
  ) {}

  async signIn(dto: SignInDto, response: Response): Promise<AuthResponseDto> {
    this.pendingGoogleService.clearAllCookies(response);

    const user = await this.userRepository.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!(await comparePassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerified && !user.googleId) {
      await this.authEmailService.sendEmailVerificationEmail(user);
    }

    return this.authSessionService.createSession(response, user);
  }

  async signUp(dto: SignUpDto, response: Response): Promise<AuthResponseDto> {
    this.pendingGoogleService.clearAllCookies(response);

    if (await this.userRepository.findByEmailWithDeleted(dto.email)) {
      throw new ConflictException('An account with this email already exists.');
    }

    if (await this.userRepository.findByUsernameWithDeleted(dto.username)) {
      throw new ConflictException('This username is already taken.');
    }

    const passwordHash = await hashPassword(dto.password);
    const otpCode = generateOtpCode(6);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(UserEntity);
      const otpCodeRepository = queryRunner.manager.getRepository(OtpCodeEntity);

      const user = await userRepository.save(userRepository.create({ ...dto, passwordHash }));

      await otpCodeRepository.delete({
        userId: user.id,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
      });

      await otpCodeRepository.save(
        otpCodeRepository.create({
          userId: user.id,
          purpose: OtpPurpose.EMAIL_VERIFICATION,
          codeHash: await hashOtpCode(otpCode),
          expiresAt: generateExpirationInMinutes(OTP_CODE_EXPIRATION_IN_MINUTES),
        }),
      );

      await queryRunner.commitTransaction();

      await this.emailService.sendEmailVerificationEmail(user.email, user.name, otpCode);

      return this.authSessionService.createSession(response, user);
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException('Failed to create account.');
    } finally {
      await queryRunner.release();
    }
  }

  async signOut(request: Request, response: Response): Promise<void> {
    const refreshToken = getRefreshTokenFromCookie(request);

    if (refreshToken) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
    }

    clearAuthCookies(response);
  }

  async signOutAll(userId: number, response: Response): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);

    clearAuthCookies(response);
  }
}
