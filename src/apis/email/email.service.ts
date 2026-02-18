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

  async sendEmailVerificationEmail(email: string, name: string, code: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const logoUrl = `${frontendUrl}/assets/logo-light.png`;

    const html = await this.templateService.render('verification-email', {
      name,
      code,
      logoUrl,
    });

    await this.resend.emails.send({
      from: `artefolio <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Verification email code',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, code: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const logoUrl = `${frontendUrl}/assets/logo-light.png`;

    const html = await this.templateService.render('password-reset', {
      name,
      code,
      logoUrl,
    });

    await this.resend.emails.send({
      from: `artefolio <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Password reset code',
      html: html,
    });
  }
}
