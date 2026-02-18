import { IsNotEmpty, IsNumber } from 'class-validator';

export class ResendCooldownEmailDto {
  @IsNumber()
  @IsNotEmpty()
  retryAfterSeconds: number;
}
