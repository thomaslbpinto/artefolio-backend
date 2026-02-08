import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
