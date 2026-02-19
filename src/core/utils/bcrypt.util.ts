export const BCRYPT_SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 12;
