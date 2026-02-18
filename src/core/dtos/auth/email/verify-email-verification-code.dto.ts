import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'code must contain exactly 6 digits' })
  code: string;
}
