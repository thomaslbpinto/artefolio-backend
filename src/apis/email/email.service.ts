import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';

    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const logoUrl = `${frontendUrl}/assets/logo-light.png`;

    await this.resend.emails.send({
      from: `artefolio <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Verify your email',
      html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body style="margin:0;padding:0;">
    <div style="
      background-color:#fafafa;
      padding:48px 32px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
    ">
      <div style="max-width:448px;margin:0 auto;">

        <div style="text-align:center;margin-bottom:32px;">
          <img
            src="${logoUrl}"
            alt="artefolio logo"
            width="140"
            style="display:block;margin:0 auto;"
          />
        </div>

        <div style="
          background-color:rgba(224,224,224,0.3);
          border:1px solid #e0e0e0;
          padding:16px;
          margin-bottom:24px;
        ">
          <p style="margin:0 0 8px 0;font-size:13px;color:#6f6f6f;line-height:1.5;">
            Hi <span style="color:#121212;">${name}</span>,
          </p>
          <p style="margin:0 0 8px 0;font-size:13px;color:#6f6f6f;line-height:1.5;">
            We sent this email to confirm your address. Click the button below to verify your account.
          </p>
          <p style="margin:0;font-size:13px;color:#6f6f6f;line-height:1.5;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>

        <div style="margin-bottom:16px;">
          <a
            href="${verificationUrl}"
            style="
              display:block;
              width:100%;
              background-color:#c7372f;
              color:#ffffff;
              text-align:center;
              padding:12px 16px;
              text-decoration:none;
              font-weight:500;
              font-size:13px;
              line-height:1;
              box-sizing:border-box;
            "
          >
            Verify email address
          </a>
        </div>

        <p style="
          margin:0;
          font-size:11px;
          color:#6f6f6f;
          line-height:1.5;
          text-align:center;
        ">
          If you didn't create an account with artefolio, you can safely ignore this email.
        </p>

      </div>
    </div>
  </body>
</html>
      `,
    });
  }
}
