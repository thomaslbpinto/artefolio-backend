import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendPasswordResetEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
