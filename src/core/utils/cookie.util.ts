import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
};

export function getCookieOptions(config: ConfigService): CookieOptions {
  return {
    httpOnly: true,
    secure: config.get('NODE_ENV') === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

export function setCookie(
  response: Response,
  name: string,
  value: string,
  options: CookieOptions,
  maxAge: number,
): void {
  response.cookie(name, value, { ...options, maxAge });
}

export function getCookie(request: Request, name: string): string | null {
  return (request.cookies as Record<string, string> | undefined)?.[name] ?? null;
}

export function clearCookie(response: Response, name: string): void {
  response.clearCookie(name, { path: '/' });
}
