import { Body, Controller, Get, Post } from '@nestjs/common';
import { VerifyEmailVerificationCodeDto } from 'src/core/dtos/auth/email/verify-email-verification-code.dto';
import { Public } from 'src/core/decorators/public.decorator';
import { ResendEmailVerificationEmailDto } from 'src/core/dtos/auth/email/resend-email-verification-email.dto';
import { AuthEmailService } from '../services/auth-email.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserEntity } from 'src/core/entities/user.entity';
import { ResendCooldownEmailDto } from 'src/core/dtos/auth/email/resend-cooldown-email.dto';

@Controller('auth/email')
export class AuthEmailController {
  constructor(private readonly authEmailService: AuthEmailService) {}

  @Get('resend-cooldown')
  async getEmailVerificationResendCooldown(@CurrentUser() user: UserEntity): Promise<ResendCooldownEmailDto> {
    return this.authEmailService.getResendCooldown(user.id);
  }

  @Post('verify-verification-code')
  async verifyEmailVerificationCode(
    @CurrentUser() user: UserEntity,
    @Body() dto: VerifyEmailVerificationCodeDto,
  ): Promise<void> {
    await this.authEmailService.verifyEmailVerificationCode(user, dto.code);
  }

  @Public()
  @Post('resend-verification-email')
  async resendEmailVerificationEmail(@Body() dto: ResendEmailVerificationEmailDto): Promise<void> {
    await this.authEmailService.resendEmailVerificationEmail(dto.email);
  }
}
