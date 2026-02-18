import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SendPasswordResetEmailDto } from 'src/core/dtos/auth/password/send-password-reset-email.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { VerifyPasswordResetCodeDto } from 'src/core/dtos/auth/password/verify-password-reset-code.dto';
import { ResetPasswordDto } from 'src/core/dtos/auth/password/reset-password.dto';
import { AuthPasswordService } from '../services/auth-password.service';
import { ResendCooldownResetPasswordDto } from 'src/core/dtos/auth/password/resend-cooldown-reset-password.dto';

@Controller('auth/password')
export class AuthPasswordController {
  constructor(private readonly authPasswordService: AuthPasswordService) {}

  @Public()
  @Get('resend-cooldown')
  async getPasswordResetResendCooldown(@Query('email') email: string): Promise<ResendCooldownResetPasswordDto> {
    return this.authPasswordService.getResendCooldown(email);
  }

  @Public()
  @Post('send-reset-email')
  async sendPasswordResetEmail(@Body() dto: SendPasswordResetEmailDto): Promise<void> {
    await this.authPasswordService.sendPasswordResetEmail(dto.email);
  }

  @Public()
  @Post('verify-reset-code')
  async verifyPasswordResetCode(@Body() dto: VerifyPasswordResetCodeDto): Promise<void> {
    await this.authPasswordService.verifyPasswordResetCode(dto.email, dto.code);
  }

  @Public()
  @Post('reset')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authPasswordService.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}
