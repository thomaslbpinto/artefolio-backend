import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/core/entities/user.entity';
import { UserResponseDto } from 'src/core/dtos/user.response.dto';
import { AuthResponseDto } from 'src/core/dtos/auth/auth-response.dto';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { generateHexToken } from 'src/core/utils/token.util';
import { assertTokenExists, assertTokenNotExpired } from 'src/core/utils/token.util';
import { generateExpirationInDays } from 'src/core/utils/expiration.util';
import {
  clearAuthCookies,
  getRefreshTokenFromCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from 'src/core/helpers/auth-cookie.helper';
import { RefreshTokenRepository } from '../../refresh-token/refresh-token.repository';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async createSession(response: Response, user: UserEntity | UserResponseDto): Promise<AuthResponseDto> {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = generateHexToken(64);

    await this.refreshTokenRepository.create(user.id, refreshToken, generateExpirationInDays(30));

    setAccessTokenCookie(response, accessToken, this.configService);
    setRefreshTokenCookie(response, refreshToken, this.configService);

    return plainToInstance(AuthResponseDto, { user }, CLASS_TRANSFORMER_OPTIONS);
  }

  async refreshAccessToken(request: Request, response: Response): Promise<AuthResponseDto> {
    const refreshToken = getRefreshTokenFromCookie(request);

    if (!refreshToken) {
      clearAuthCookies(response);
      throw new UnauthorizedException('No refresh token.');
    }

    const storedRefreshToken = await this.refreshTokenRepository.findByToken(refreshToken);

    assertTokenExists(storedRefreshToken, 'Invalid refresh token.');
    assertTokenNotExpired(storedRefreshToken, 'Refresh token expired.', async () => {
      await this.refreshTokenRepository.deleteByToken(refreshToken);
    });

    const accessToken = this.jwtService.sign({
      sub: storedRefreshToken.userId,
      email: storedRefreshToken.user.email,
    });

    setAccessTokenCookie(response, accessToken, this.configService);

    return plainToInstance(AuthResponseDto, { user: storedRefreshToken.user }, CLASS_TRANSFORMER_OPTIONS);
  }
}
