import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';

type TokenBase = {
  expiresAt: Date;
};

export function assertTokenExists<T extends TokenBase>(token: T | null, message: string): asserts token is T {
  if (!token) {
    throw new BadRequestException(message);
  }
}

export function assertTokenNotExpired(token: TokenBase, message: string, onExpired?: () => void | Promise<void>): void {
  if (token.expiresAt < new Date()) {
    if (onExpired) {
      void onExpired();
    }

    throw new BadRequestException(message);
  }
}

export function generateHexToken(bytes: number): string {
  return randomBytes(bytes).toString('hex');
}
