import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { COOKIE_ACCESS_TOKEN } from '../constants/cookie.constant';
import { UserRepository } from 'src/apis/user/user.repository';

export interface JwtPayload {
  sub: number;
  email: string;
}

function extractJwtFromCookie(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return (cookies?.[COOKIE_ACCESS_TOKEN] as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new HttpException('JWT_SECRET not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne(payload.sub);

    if (!user) {
      return null;
    }

    return user;
  }
}
