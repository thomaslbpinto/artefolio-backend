import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { plainToInstance } from 'class-transformer';
import { randomBytes } from 'crypto';
import { AuthRepository } from './auth.repository';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { SignInDto } from 'src/core/dtos/auth/sign-in.dto';
import { SignUpDto } from 'src/core/dtos/auth/sign-up.dto';
import { GoogleSignInDto } from 'src/core/dtos/auth/google-sign-in.dto';
import { GoogleSignUpInitiateDto } from 'src/core/dtos/auth/google-sign-up-initiate.dto';
import { GoogleSignUpCompleteDto } from 'src/core/dtos/auth/google-sign-up-complete.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { UserEntity } from 'src/core/entities/user.entity';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { hashPassword, comparePassword } from 'src/core/utils/password.util';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      console.warn(
        'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured. Google authentication will not work.',
      );
    }
    this.googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async signIn(dto: SignInDto): Promise<AuthResponseDto> {
    const existingUserWithEmail = await this.authRepository.findUserByEmail(
      dto.email,
    );

    if (!existingUserWithEmail || !existingUserWithEmail.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(
      dto.password,
      existingUserWithEmail.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(existingUserWithEmail);
  }

  async signUp(dto: SignUpDto): Promise<AuthResponseDto> {
    const existingUserWithEmail =
      await this.authRepository.findUserByEmailWithDeleted(dto.email);

    if (existingUserWithEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    const existingUserWithUsername =
      await this.authRepository.findUserByUsernameWithDeleted(dto.username);

    if (existingUserWithUsername) {
      throw new ConflictException('This username is already taken');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.authRepository.createUserWithPassword(
      dto.name,
      dto.username,
      dto.email,
      passwordHash,
    );

    return this.generateAuthResponse(user);
  }

  async googleSignIn(dto: GoogleSignInDto): Promise<AuthResponseDto> {
    const profile = await this.exchangeCodeForProfile(dto.code);

    const existingUserWithGoogleId =
      await this.authRepository.findUserByGoogleId(profile.googleId);

    if (!existingUserWithGoogleId) {
      throw new UnauthorizedException(
        'No account linked to this Google account',
      );
    }

    return this.generateAuthResponse(existingUserWithGoogleId);
  }

  async googleSignUpInitiate(
    dto: GoogleSignUpInitiateDto,
  ): Promise<GoogleProfileDto> {
    const profile = await this.exchangeCodeForProfile(dto.code);

    const existingUserWithGoogleId =
      await this.authRepository.findUserByGoogleId(profile.googleId);

    if (existingUserWithGoogleId) {
      throw new ConflictException(
        'An account is already linked to this Google account',
      );
    }

    const existingUserWithEmail =
      await this.authRepository.findUserByEmailWithDeleted(profile.email);

    if (existingUserWithEmail) {
      throw new ConflictException(
        'This email is already linked to another account',
      );
    }

    return profile;
  }

  async googleSignUpComplete(
    dto: GoogleSignUpCompleteDto,
  ): Promise<AuthResponseDto> {
    const existingUserWithGoogleId =
      await this.authRepository.findUserByGoogleId(dto.googleId);

    if (existingUserWithGoogleId) {
      throw new ConflictException(
        'An account is already linked to this Google account',
      );
    }

    const existingUserWithEmail =
      await this.authRepository.findUserByEmailWithDeleted(dto.email);

    if (existingUserWithEmail) {
      throw new ConflictException(
        'This email is already linked to another account',
      );
    }

    const existingUserWithUsername =
      await this.authRepository.findUserByUsernameWithDeleted(dto.username);

    if (existingUserWithUsername) {
      throw new ConflictException('This username is already taken');
    }

    const user = await this.authRepository.createUserWithGoogleId(
      dto.name,
      dto.username,
      dto.email,
      dto.googleId,
      dto.avatarUrl,
    );

    return this.generateAuthResponse(user);
  }

  private async exchangeCodeForProfile(
    code: string,
  ): Promise<GoogleProfileDto> {
    try {
      const { tokens } = await this.googleClient.getToken(code);

      if (!tokens.id_token) {
        throw new BadRequestException('No id token received from Google');
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email || !payload.sub) {
        throw new BadRequestException('Invalid Google token payload');
      }

      return plainToInstance(
        GoogleProfileDto,
        {
          email: payload.email,
          name: payload.name || '',
          googleId: payload.sub,
          avatarUrl: payload.picture || null,
        },
        CLASS_TRANSFORMER_OPTIONS,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log(error);
      throw new BadRequestException('Invalid or expired authorization code');
    }
  }

  private async generateAuthResponse(
    user: UserEntity,
  ): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token
    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    // Save refresh token to database
    await this.refreshTokenRepository.createRefreshToken(
      user.id,
      refreshToken,
      expiresAt,
    );

    const userDto = plainToInstance(
      UserResponseDto,
      user,
      CLASS_TRANSFORMER_OPTIONS,
    );

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken,
        user: userDto,
      },
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    // Find refresh token in database
    const storedToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new access token
    const payload = { sub: storedToken.userId, email: storedToken.user.email };
    const accessToken = this.jwtService.sign(payload);

    const userDto = plainToInstance(
      UserResponseDto,
      storedToken.user,
      CLASS_TRANSFORMER_OPTIONS,
    );

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken, // Return same refresh token
        user: userDto,
      },
      CLASS_TRANSFORMER_OPTIONS,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async logoutAll(userId: number): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(userId);
  }
}
