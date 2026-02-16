import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { UserRepository } from '../user/user.repository';
import { RefreshAccessTokenRepository } from '../refresh-access-token/refresh-access-token.repository';
import { EmailVerificationTokenRepository } from '../email-verification-token/email-verification-token.repository';
import { PasswordResetTokenRepository } from '../password-reset-token/password-reset-token.repository';
import { EmailService } from '../email/email.service';
import { SignInDto } from 'src/core/dtos/auth/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign-up.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google-sign-up-complete.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { TokenEntity } from 'src/core/entities/token.entity';
import { TokenType } from 'src/core/enums/token-type.enum';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { hashPassword, comparePassword } from 'src/core/utils/password.util';
import {
  assertTokenExists,
  assertTokenNotExpired,
  generateHexToken,
  generateExpirationInDays,
  generateExpirationInHours,
} from 'src/core/utils/token.util';
import {
  clearAuthCookies,
  getRefreshTokenFromCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from 'src/core/helpers/auth-cookie.helper';
import { PendingGoogleService } from './services/pending-google.service';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshAccessTokenRepository: RefreshAccessTokenRepository,
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly pendingGoogleService: PendingGoogleService,
  ) {}

  private async authenticateUserAndCreateSession(
    response: Response,
    user: UserEntity | UserResponseDto,
  ): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = generateHexToken(64);

    await this.refreshAccessTokenRepository.createToken(user.id, refreshToken, generateExpirationInDays(30));

    setAccessTokenCookie(response, accessToken, this.configService);
    setRefreshTokenCookie(response, refreshToken, this.configService);

    return plainToInstance(AuthResponseDto, { user }, CLASS_TRANSFORMER_OPTIONS);
  }

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
      await this.createTokenAndSendVerificationEmail(user);
    }

    return this.authenticateUserAndCreateSession(response, user);
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(UserEntity);
      const tokenRepository = queryRunner.manager.getRepository(TokenEntity);

      const user = await userRepository.save(userRepository.create({ ...dto, passwordHash }));

      const token = generateHexToken(32);

      await tokenRepository.save(
        tokenRepository.create({
          userId: user.id,
          token: token,
          type: TokenType.EMAIL_VERIFICATION,
          expiresAt: generateExpirationInHours(24),
        }),
      );

      await this.emailService.sendVerificationEmail(user.email, user.name, token);

      await queryRunner.commitTransaction();

      return this.authenticateUserAndCreateSession(response, user);
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException('Failed to create account.');
    } finally {
      await queryRunner.release();
    }
  }

  async handleGoogleCallback(profile: GoogleProfileDto, response: Response): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const user = await this.userRepository.findByGoogleId(profile.googleId);

    if (user) {
      await this.authenticateUserAndCreateSession(response, user);
      response.redirect(frontendUrl);
      return;
    }

    if (await this.userRepository.findByEmail(profile.email)) {
      const linkToken = this.pendingGoogleService.createLinkToken(profile);
      this.pendingGoogleService.setLinkCookie(response, linkToken);
      response.redirect(`${frontendUrl}/link-google-account`);
      return;
    }

    const signUpToken = this.pendingGoogleService.createSignUpToken(profile);
    this.pendingGoogleService.setSignUpCookie(response, signUpToken);
    response.redirect(`${frontendUrl}/complete-google-sign-up`);
  }

  async completeGoogleSignUp(
    dto: GoogleSignUpCompleteDto,
    request: Request,
    response: Response,
  ): Promise<AuthResponseDto> {
    const payload = this.pendingGoogleService.getSignUpCookie(request);

    if (!payload) {
      throw new BadRequestException('Invalid or expired pending signup.');
    }

    this.pendingGoogleService.clearSignUpCookie(response);

    if (await this.userRepository.findByEmailWithDeleted(payload.email)) {
      throw new ConflictException('An account with this email already exists.');
    }

    const username = dto.username;

    if (await this.userRepository.findByUsernameWithDeleted(username)) {
      throw new ConflictException('This username is already taken.');
    }

    const user = await this.userRepository.create({
      name: dto.name,
      username: username,
      email: payload.email,
      googleId: payload.googleId,
      avatarUrl: payload.avatarUrl,
    });

    return this.authenticateUserAndCreateSession(response, user);
  }

  async googleLinkAccount(request: Request, response: Response): Promise<AuthResponseDto> {
    const payload = this.pendingGoogleService.getLinkCookie(request);

    if (!payload) {
      throw new BadRequestException('Invalid or expired pending link.');
    }

    this.pendingGoogleService.clearLinkCookie(response);

    const user = await this.userRepository.findByEmail(payload.email);

    if (!user || user.googleId) {
      throw new BadRequestException('Account cannot be linked.');
    }

    const updatedUser = await this.userRepository.update(user.id, {
      googleId: payload.googleId,
      avatarUrl: payload.avatarUrl,
    });

    await this.emailVerificationTokenRepository.deleteTokensByUserId(updatedUser.id);

    return this.authenticateUserAndCreateSession(response, updatedUser);
  }

  async refreshAccessToken(request: Request, response: Response): Promise<AuthResponseDto> {
    const refreshToken = getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      clearAuthCookies(response);
      throw new UnauthorizedException('No refresh token.');
    }

    const storedRefreshToken = await this.refreshAccessTokenRepository.findByToken(refreshToken);

    assertTokenExists(storedRefreshToken, 'Invalid refresh token.');
    assertTokenNotExpired(storedRefreshToken, 'Refresh token expired.', async () => {
      await this.refreshAccessTokenRepository.deleteByToken(refreshToken);
    });

    const accessToken = this.jwtService.sign({
      sub: storedRefreshToken.userId,
      email: storedRefreshToken.user.email,
    });

    setAccessTokenCookie(response, accessToken, this.configService);

    return plainToInstance(AuthResponseDto, { user: storedRefreshToken.user }, CLASS_TRANSFORMER_OPTIONS);
  }

  async signOut(request: Request, response: Response): Promise<void> {
    const refreshToken = getRefreshTokenFromCookie(request);

    if (refreshToken) {
      await this.refreshAccessTokenRepository.deleteByToken(refreshToken);
    }

    clearAuthCookies(response);
  }

  async signOutAll(userId: number, response: Response): Promise<void> {
    await this.refreshAccessTokenRepository.deleteByUserId(userId);

    clearAuthCookies(response);
  }

  async createTokenAndSendVerificationEmail(user: UserEntity): Promise<void> {
    const token = generateHexToken(32);
    const userId = user.id;

    await this.emailVerificationTokenRepository.deleteTokensByUserId(userId);
    await this.emailVerificationTokenRepository.createToken(userId, token, generateExpirationInHours(1));
    await this.emailService.sendVerificationEmail(user.email, user.name, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const emailVerificationToken = await this.emailVerificationTokenRepository.findByToken(token);

    assertTokenExists(emailVerificationToken, 'Invalid email verification token.');
    assertTokenNotExpired(emailVerificationToken, 'Email verification token expired.');

    await this.emailVerificationTokenRepository.deleteByToken(emailVerificationToken.token);
    await this.userRepository.update(emailVerificationToken.userId, { emailVerified: true });
  }

  async resendVerificationEmail(email: string): Promise<void> {
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

    await this.createTokenAndSendVerificationEmail(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return;
    }

    const token = generateHexToken(32);
    const userId = user.id;

    await this.passwordResetTokenRepository.deleteTokensByUserId(userId);
    await this.passwordResetTokenRepository.createToken(userId, token, generateExpirationInHours(1));
    await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordResetToken = await this.passwordResetTokenRepository.findByToken(token);

    assertTokenExists(passwordResetToken, 'Invalid password reset token.');
    assertTokenNotExpired(passwordResetToken, 'Password reset token expired.');

    const userId = passwordResetToken.userId;

    await this.userRepository.update(userId, { password: newPassword });
    await this.passwordResetTokenRepository.deleteByToken(passwordResetToken.token);
    await this.refreshAccessTokenRepository.deleteByUserId(userId);
  }
}
