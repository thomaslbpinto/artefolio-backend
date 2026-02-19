import { JwtService } from '@nestjs/jwt';
import { GoogleProfileDto } from 'src/core/dtos/auth/google/google-profile.dto';
import { clearCookie, getCookie, getCookieOptions, setCookie } from 'src/core/utils/cookie.util';
import {
  COOKIE_PENDING_GOOGLE_LINK,
  COOKIE_PENDING_GOOGLE_SIGNUP,
  PENDING_GOOGLE_TOKEN_EXPIRY,
  PENDING_GOOGLE_TOKEN_MAX_AGE_MS,
} from 'src/core/constants/cookie.constant';
import { Response, Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { CLASS_TRANSFORMER_OPTIONS } from 'src/core/configs/class-transformer.config';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export type PendingToken = GoogleProfileDto & {
  purpose: string;
};

@Injectable()
export class PendingGoogleService {
  private readonly expiresIn = PENDING_GOOGLE_TOKEN_EXPIRY;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  createSignUpToken(profile: GoogleProfileDto): string {
    return this.createToken(profile, COOKIE_PENDING_GOOGLE_SIGNUP);
  }

  createLinkToken(profile: GoogleProfileDto): string {
    return this.createToken(profile, COOKIE_PENDING_GOOGLE_LINK);
  }

  getSignUpCookie(request: Request): GoogleProfileDto | null {
    return this.getCookie(request, COOKIE_PENDING_GOOGLE_SIGNUP);
  }

  getLinkCookie(request: Request): GoogleProfileDto | null {
    return this.getCookie(request, COOKIE_PENDING_GOOGLE_LINK);
  }

  setSignUpCookie(response: Response, token: string): void {
    this.setCookie(response, COOKIE_PENDING_GOOGLE_SIGNUP, token);
  }

  setLinkCookie(response: Response, token: string): void {
    this.setCookie(response, COOKIE_PENDING_GOOGLE_LINK, token);
  }

  clearSignUpCookie(response: Response): void {
    this.clearCookie(response, COOKIE_PENDING_GOOGLE_SIGNUP);
  }

  clearLinkCookie(response: Response): void {
    this.clearCookie(response, COOKIE_PENDING_GOOGLE_LINK);
  }

  clearAllCookies(response: Response): void {
    this.clearSignUpCookie(response);
    this.clearLinkCookie(response);
  }

  private createToken(profile: GoogleProfileDto, purpose: string): string {
    return this.jwtService.sign({ ...profile, purpose }, { expiresIn: this.expiresIn });
  }

  private getCookie(request: Request, purpose: string): GoogleProfileDto | null {
    const token = getCookie(request, purpose);

    if (!token) {
      return null;
    }

    return this.verifyToken(token, purpose);
  }

  private verifyToken(token: string, purpose: string): GoogleProfileDto | null {
    try {
      const decoded = this.jwtService.verify<PendingToken>(token);

      if (decoded.purpose !== purpose) {
        return null;
      }

      return plainToInstance(GoogleProfileDto, decoded, CLASS_TRANSFORMER_OPTIONS);
    } catch {
      return null;
    }
  }

  private setCookie(response: Response, purpose: string, token: string): void {
    setCookie(response, purpose, token, getCookieOptions(this.configService), PENDING_GOOGLE_TOKEN_MAX_AGE_MS);
  }

  private clearCookie(response: Response, purpose: string): void {
    clearCookie(response, purpose);
  }
}
