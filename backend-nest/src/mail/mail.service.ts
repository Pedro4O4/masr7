import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'EventTix <onboarding@resend.dev>';

    console.log('📧 Mail Service Initializing...');
    console.log(`   RESEND_API_KEY: ${resendApiKey ? '✅ SET (' + resendApiKey.length + ' chars)' : '❌ NOT SET'}`);
    console.log(`   EMAIL_FROM: ${this.fromEmail}`);

    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendVerificationOTP(email: string, otp: string) {
    this.logOTPTerminal(email, otp, 'VERIFICATION CODE');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Account Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering with EventTix. Please verify your account to continue.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="font-size: 32px; color: #8B5CF6; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email from EventTix. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendMail(email, 'Account Verification - EventTix', html);
  }

  async sendPasswordResetOTP(email: string, otp: string) {
    this.logOTPTerminal(email, otp, 'PASSWORD RESET CODE');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your EventTix account.</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="font-size: 32px; color: #8B5CF6; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">
          This is an automated email from EventTix. Please do not reply to this email.
        </p>
      </div>
    `;

    return this.sendMail(email, 'Password Reset OTP - EventTix', html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.warn('⚠️ Resend not configured - email not sent (check RESEND_API_KEY)');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('❌ Email sending failed:', error.message);
        throw new InternalServerErrorException('Failed to send email: ' + error.message);
      }

      console.log('✅ Email sent via Resend:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error: any) {
      console.error('❌ Email sending failed:', error.message);
      throw new InternalServerErrorException(
        'Failed to send email. Please try again later or contact support.',
      );
    }
  }

  private logOTPTerminal(email: string, otp: string, type: string) {
    console.log('\n========================================');
    console.log(`📧 ${type}`);
    console.log('========================================');
    console.log(`Email: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: 10 minutes`);
    console.log('========================================\n');
  }
}
