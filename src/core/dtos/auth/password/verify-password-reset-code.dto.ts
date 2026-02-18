import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyPasswordResetCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'code must contain exactly 6 digits' })
  code: string;
}
