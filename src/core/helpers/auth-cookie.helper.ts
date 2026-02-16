import { clearCookie, getCookie, getCookieOptions, setCookie } from '../utils/cookie.util';
import {
  COOKIE_ACCESS_TOKEN,
  ACCESS_TOKEN_MAX_AGE_MS,
  COOKIE_REFRESH_TOKEN,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../constants/cookie.constant';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export function getAuthTokenFromCookie(request: Request, purpose: string): string | null {
  return getCookie(request, purpose);
}

export function getAccessTokenFromCookie(request: Request): string | null {
  return getAuthTokenFromCookie(request, COOKIE_ACCESS_TOKEN);
}

export function getRefreshTokenFromCookie(request: Request): string | null {
  return getAuthTokenFromCookie(request, COOKIE_REFRESH_TOKEN);
}

export function setAuthCookie(
  response: Response,
  purpose: string,
  token: string,
  config: ConfigService,
  maxAge: number,
): void {
  setCookie(response, purpose, token, getCookieOptions(config), maxAge);
}

export function setAccessTokenCookie(response: Response, token: string, config: ConfigService): void {
  setAuthCookie(response, COOKIE_ACCESS_TOKEN, token, config, ACCESS_TOKEN_MAX_AGE_MS);
}

export function setRefreshTokenCookie(response: Response, token: string, config: ConfigService): void {
  setAuthCookie(response, COOKIE_REFRESH_TOKEN, token, config, REFRESH_TOKEN_MAX_AGE_MS);
}

export function clearAuthCookies(response: Response): void {
  clearAccessTokenCookie(response);
  clearRefreshTokenCookie(response);
}

export function clearAccessTokenCookie(response: Response): void {
  clearCookie(response, COOKIE_ACCESS_TOKEN);
}

export function clearRefreshTokenCookie(response: Response): void {
  clearCookie(response, COOKIE_REFRESH_TOKEN);
}
