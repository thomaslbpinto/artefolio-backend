import { JwtService } from '@nestjs/jwt';
import { GoogleProfileDto } from 'src/core/dtos/auth/google-profile.dto';
import { clearCookie, getCookie, getCookieOptions, setCookie } from '../utils/cookie.util';
import {
  COOKIE_PENDING_GOOGLE_LINK,
  COOKIE_PENDING_GOOGLE_SIGNUP,
  PENDING_GOOGLE_TOKEN_MAX_AGE_MS,
} from '../constants/cookie.constant';
import { Response, Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { CLASS_TRANSFORMER_OPTIONS } from '../configs/class-transformer.config';
import { ConfigService } from '@nestjs/config';

const PENDING_JWT_EXPIRES_IN = '10m';

export type PendingToken = GoogleProfileDto & { purpose: string };

export function createPendingToken(jwtService: JwtService, profile: GoogleProfileDto, purpose: string): string {
  return jwtService.sign({ ...profile, purpose }, { expiresIn: PENDING_JWT_EXPIRES_IN });
}

export function createPendingGoogleSignUpToken(jwtService: JwtService, profile: GoogleProfileDto): string {
  return createPendingToken(jwtService, profile, COOKIE_PENDING_GOOGLE_SIGNUP);
}

export function createPendingGoogleLinkToken(jwtService: JwtService, profile: GoogleProfileDto): string {
  return createPendingToken(jwtService, profile, COOKIE_PENDING_GOOGLE_LINK);
}

export function verifyPendingToken(jwtService: JwtService, token: string, purpose: string): PendingToken | null {
  try {
    const decoded = jwtService.verify<PendingToken>(token);
    if (decoded.purpose === purpose) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function getPendingGoogleCookie(
  request: Request,
  jwtService: JwtService,
  purpose: string,
): GoogleProfileDto | null {
  const token = getCookie(request, purpose);
  if (!token) {
    return null;
  }
  const payload = verifyPendingToken(jwtService, token, purpose);
  if (!payload) {
    return null;
  }
  return plainToInstance(GoogleProfileDto, payload, CLASS_TRANSFORMER_OPTIONS);
}

export function getPendingGoogleSignUpCookie(request: Request, jwtService: JwtService): GoogleProfileDto | null {
  return getPendingGoogleCookie(request, jwtService, COOKIE_PENDING_GOOGLE_SIGNUP);
}

export function getPendingGoogleLinkCookie(request: Request, jwtService: JwtService): GoogleProfileDto | null {
  return getPendingGoogleCookie(request, jwtService, COOKIE_PENDING_GOOGLE_LINK);
}

export function setPendingGoogleCookie(
  response: Response,
  purpose: string,
  token: string,
  config: ConfigService,
): void {
  setCookie(response, purpose, token, getCookieOptions(config), PENDING_GOOGLE_TOKEN_MAX_AGE_MS);
}

export function setPendingGoogleSignUpCookie(response: Response, token: string, config: ConfigService): void {
  setPendingGoogleCookie(response, COOKIE_PENDING_GOOGLE_SIGNUP, token, config);
}

export function setPendingGoogleLinkCookie(response: Response, token: string, config: ConfigService): void {
  setPendingGoogleCookie(response, COOKIE_PENDING_GOOGLE_LINK, token, config);
}

export function clearPendingGoogleCookies(response: Response): void {
  clearPendingGoogleSignUpCookie(response);
  clearPendingGoogleLinkCookie(response);
}

export function clearPendingGoogleSignUpCookie(response: Response): void {
  clearCookie(response, COOKIE_PENDING_GOOGLE_SIGNUP);
}

export function clearPendingGoogleLinkCookie(response: Response): void {
  clearCookie(response, COOKIE_PENDING_GOOGLE_LINK);
}
