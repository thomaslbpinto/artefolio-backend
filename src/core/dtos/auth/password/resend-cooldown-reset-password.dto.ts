import { IsNotEmpty, IsNumber } from 'class-validator';

export class ResendCooldownResetPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  retryAfterSeconds: number;
}
