import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
