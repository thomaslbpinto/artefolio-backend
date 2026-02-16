import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const logoUrl = `${frontendUrl}/assets/logo-light.png`;

    const html = await this.templateService.render('verification-email', {
      name,
      verificationUrl,
      logoUrl,
    });

    await this.resend.emails.send({
      from: `artefolio <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Verify your email',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const logoUrl = `${frontendUrl}/assets/logo-light.png`;

    const html = await this.templateService.render('password-reset', {
      name,
      resetUrl,
      logoUrl,
    });

    await this.resend.emails.send({
      from: `artefolio <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Reset your password',
      html: html,
    });
  }
}
