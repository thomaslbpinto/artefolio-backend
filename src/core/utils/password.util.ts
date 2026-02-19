import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from './bcrypt.util';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
