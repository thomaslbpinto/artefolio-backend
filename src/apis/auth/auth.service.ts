import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { AuthRepository } from './auth.repository';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { EmailVerificationRepository } from '../email-verification/email-verification.repository';
import { EmailService } from '../email/email.service';
import { SignInDto } from 'src/core/dtos/auth/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign-up.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { EmailVerificationTokenEntity } from 'src/core/entities/email-verification-token.entity';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { hashPassword, comparePassword } from 'src/core/utils/password.util';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_PENDING_GOOGLE_SIGNUP,
  COOKIE_PENDING_GOOGLE_LINK,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  PENDING_GOOGLE_MAX_AGE_MS,
} from 'src/core/constants/cookie.constants';
import type { GoogleStrategyProfile } from 'src/core/strategies/google.strategy';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google-sign-up-complete.dto';

const PENDING_JWT_EXPIRES_IN = '10m';
const EMAIL_VERIFICATION_EXPIRES_HOURS = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
    );
  }

  clearPendingGoogleCookies(response: Response): void {
    response.clearCookie(COOKIE_PENDING_GOOGLE_SIGNUP, { path: '/' });
    response.clearCookie(COOKIE_PENDING_GOOGLE_LINK, { path: '/' });
  }

  clearPendingSignupCookie(response: Response): void {
    response.clearCookie(COOKIE_PENDING_GOOGLE_SIGNUP, { path: '/' });
  }

  clearPendingLinkCookie(response: Response): void {
    response.clearCookie(COOKIE_PENDING_GOOGLE_LINK, { path: '/' });
  }

  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
  } {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    };
  }

  async signIn(dto: SignInDto, response: Response): Promise<AuthResponseDto> {
    this.clearPendingGoogleCookies(response);

    const existingUser = await this.authRepository.findUserByEmail(dto.email);

    if (!existingUser || !existingUser.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      existingUser.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!existingUser.emailVerified && !existingUser.googleId) {
      await this.createAndSendVerificationToken(existingUser);
    }

    return this.setAuthCookiesAndReturnUser(existingUser, response);
  }

  async signUp(dto: SignUpDto, response: Response): Promise<AuthResponseDto> {
    this.clearPendingGoogleCookies(response);

    const existingUserWithEmail =
      await this.authRepository.findUserByEmailWithDeleted(dto.email);

    if (existingUserWithEmail) {
      throw new ConflictException('An account with this email already exists.');
    }

    const existingUserWithUsername =
      await this.authRepository.findUserByUsernameWithDeleted(dto.username);

    if (existingUserWithUsername) {
      throw new ConflictException('This username is already taken.');
    }

    const passwordHash = await hashPassword(dto.password);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(UserEntity);
      const user = userRepository.create({
        name: dto.name,
        username: dto.username,
        email: dto.email,
        passwordHash,
      });
      await queryRunner.manager.save(user);

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(
        expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRES_HOURS,
      );

      const tokenRepository = queryRunner.manager.getRepository(
        EmailVerificationTokenEntity,
      );
      const verificationToken = tokenRepository.create({
        userId: user.id,
        token,
        expiresAt,
      });
      await queryRunner.manager.save(verificationToken);

      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        token,
      );

      await queryRunner.commitTransaction();

      return this.setAuthCookiesAndReturnUser(user, response);
    } catch {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to create account. Please try again.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async handleGoogleCallback(
    profile: GoogleStrategyProfile,
    response: Response,
  ): Promise<void> {
    const frontendUrl = this.getFrontendUrl();

    const existingUserByGoogleId = await this.authRepository.findUserByGoogleId(
      profile.googleId,
    );

    if (existingUserByGoogleId) {
      await this.setAuthCookiesAndReturnUser(existingUserByGoogleId, response);
      response.redirect(frontendUrl);
      return;
    }

    const userByEmail = await this.authRepository.findUserByEmail(
      profile.email,
    );

    if (userByEmail && !userByEmail.googleId) {
      const token = this.createPendingToken(
        profile,
        COOKIE_PENDING_GOOGLE_LINK,
      );

      const options = this.getCookieOptions();

      response.cookie(COOKIE_PENDING_GOOGLE_LINK, token, {
        ...options,
        maxAge: PENDING_GOOGLE_MAX_AGE_MS,
      });

      response.redirect(`${frontendUrl}/link-google-account`);

      return;
    }

    const token = this.createPendingToken(
      profile,
      COOKIE_PENDING_GOOGLE_SIGNUP,
    );

    const options = this.getCookieOptions();

    response.cookie(COOKIE_PENDING_GOOGLE_SIGNUP, token, {
      ...options,
      maxAge: PENDING_GOOGLE_MAX_AGE_MS,
    });

    response.redirect(`${frontendUrl}/complete-google-sign-up`);
  }

  getPendingSignup(response: Response): Promise<GoogleProfileDto | null> {
    const token = (
      response.req.cookies as Record<string, string> | undefined
    )?.[COOKIE_PENDING_GOOGLE_SIGNUP];

    if (!token) {
      return Promise.resolve(null);
    }

    const payload = this.verifyPendingToken<GoogleStrategyProfile>(
      token,
      COOKIE_PENDING_GOOGLE_SIGNUP,
    );
    if (!payload) return Promise.resolve(null);

    return Promise.resolve(
      plainToInstance(
        GoogleProfileDto,
        {
          email: payload.email,
          name: payload.name,
          googleId: payload.googleId,
          avatarUrl: payload.avatarUrl,
        },
        CLASS_TRANSFORMER_OPTIONS,
      ),
    );
  }

  getPendingLink(response: Response): Promise<GoogleProfileDto | null> {
    const token = (
      response.req.cookies as Record<string, string> | undefined
    )?.[COOKIE_PENDING_GOOGLE_LINK];

    if (!token) {
      return Promise.resolve(null);
    }

    const payload = this.verifyPendingToken<GoogleStrategyProfile>(
      token,
      COOKIE_PENDING_GOOGLE_LINK,
    );

    if (!payload) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      plainToInstance(
        GoogleProfileDto,
        {
          email: payload.email,
          name: payload.name,
          googleId: payload.googleId,
          avatarUrl: payload.avatarUrl,
        },
        CLASS_TRANSFORMER_OPTIONS,
      ),
    );
  }

  async completeGoogleSignUp(
    dto: GoogleSignUpCompleteDto,
    res: Response,
  ): Promise<AuthResponseDto> {
    const token = (res.req.cookies as Record<string, string> | undefined)?.[
      COOKIE_PENDING_GOOGLE_SIGNUP
    ];

    if (!token) {
      throw new BadRequestException(
        'No pending signup found. Please start the signup process again.',
      );
    }

    const payload = this.verifyPendingToken<GoogleStrategyProfile>(
      token,
      COOKIE_PENDING_GOOGLE_SIGNUP,
    );

    if (!payload) {
      throw new BadRequestException(
        'Invalid or expired pending signup. Please start the signup process again.',
      );
    }

    const existingUserWithEmail =
      await this.authRepository.findUserByEmailWithDeleted(payload.email);

    if (existingUserWithEmail) {
      res.clearCookie(COOKIE_PENDING_GOOGLE_SIGNUP, { path: '/' });
      throw new ConflictException('An account with this email already exists.');
    }

    res.clearCookie(COOKIE_PENDING_GOOGLE_SIGNUP, { path: '/' });

    const existingUserWithUsername =
      await this.authRepository.findUserByUsernameWithDeleted(dto.username);

    if (existingUserWithUsername) {
      throw new ConflictException('This username is already taken.');
    }

    const user = await this.authRepository.createUserWithGoogleId(
      dto.name,
      dto.username,
      payload.email,
      payload.googleId,
      payload.avatarUrl,
    );

    return this.setAuthCookiesAndReturnUser(user, res);
  }

  async linkGoogleAccount(response: Response): Promise<AuthResponseDto> {
    const token = (
      response.req.cookies as Record<string, string> | undefined
    )?.[COOKIE_PENDING_GOOGLE_LINK];

    if (!token) {
      throw new BadRequestException(
        'No pending link found. Please start the linking process again.',
      );
    }

    const payload = this.verifyPendingToken<GoogleStrategyProfile>(
      token,
      COOKIE_PENDING_GOOGLE_LINK,
    );

    if (!payload) {
      throw new BadRequestException(
        'Invalid or expired pending link. Please start the linking process again.',
      );
    }

    response.clearCookie(COOKIE_PENDING_GOOGLE_LINK, { path: '/' });

    const existingUser = await this.authRepository.findUserByEmail(
      payload.email,
    );

    if (!existingUser || existingUser.googleId) {
      throw new BadRequestException(
        'Account cannot be linked. Please try again.',
      );
    }

    const user = await this.authRepository.updateUserWithGoogleId(
      existingUser.id,
      payload.googleId,
      payload.avatarUrl,
    );

    await this.emailVerificationRepository.deleteTokensByUserId(user.id);

    return this.setAuthCookiesAndReturnUser(user, response);
  }

  async refreshAccessToken(
    refreshToken: string,
    response: Response,
  ): Promise<AuthResponseDto> {
    const storedToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired.');
    }

    const payload = {
      sub: storedToken.userId,
      email: storedToken.user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    const cookieOptions = this.getCookieOptions();
    response.cookie(COOKIE_ACCESS_TOKEN, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });

    return plainToInstance(
      AuthResponseDto,
      { user: storedToken.user },
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }

  private createPendingToken(
    profile: GoogleStrategyProfile,
    purpose: string,
  ): string {
    return this.jwtService.sign(
      { ...profile, purpose },
      { expiresIn: PENDING_JWT_EXPIRES_IN },
    );
  }

  private verifyPendingToken<T extends GoogleStrategyProfile>(
    token: string,
    purpose: string,
  ): T | null {
    try {
      const decoded = this.jwtService.verify<T & { purpose: string }>(token);

      if (decoded.purpose !== purpose) {
        return null;
      }

      return decoded as T;
    } catch {
      return null;
    }
  }

  private async setAuthCookiesAndReturnUser(
    user: UserEntity,
    response: Response,
  ): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.createRefreshToken(
      user.id,
      refreshToken,
      expiresAt,
    );

    const cookieOptions = this.getCookieOptions();

    response.cookie(COOKIE_ACCESS_TOKEN, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });

    response.cookie(COOKIE_REFRESH_TOKEN, refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    return plainToInstance(
      AuthResponseDto,
      { user },
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async createAndSendVerificationToken(user: UserEntity): Promise<void> {
    await this.emailVerificationRepository.deleteTokensByUserId(user.id);

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRES_HOURS);

    await this.emailVerificationRepository.createToken(
      user.id,
      token,
      expiresAt,
    );

    await this.emailService.sendVerificationEmail(user.email, user.name, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken =
      await this.emailVerificationRepository.findByToken(token);

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token.');
    }

    if (verificationToken.used) {
      throw new BadRequestException('Verification token already used.');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Verification token expired.');
    }

    await this.emailVerificationRepository.markAsUsed(verificationToken.id);
    await this.authRepository.markEmailAsVerified(verificationToken.userId);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified.');
    }

    if (user.googleId) {
      throw new BadRequestException('Google accounts are verified by default.');
    }

    await this.createAndSendVerificationToken(user);
  }
}
