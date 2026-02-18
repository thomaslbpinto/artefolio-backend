import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 12;

export function generateOtpCode(length: number): string {
  const max = 10 ** length;
  const code = randomInt(0, max);
  return code.toString().padStart(length, '0');
}

export async function hashOtpCode(code: string): Promise<string> {
  return await bcrypt.hash(code, SALT_ROUNDS);
}

export async function compareOtpCode(code: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(code, hash);
}
