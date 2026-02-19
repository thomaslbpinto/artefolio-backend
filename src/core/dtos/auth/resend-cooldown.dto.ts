import { IsNotEmpty, IsNumber } from 'class-validator';

export class ResendCooldownDto {
  @IsNumber()
  @IsNotEmpty()
  retryAfterSeconds: number;
}
