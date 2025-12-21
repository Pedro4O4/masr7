import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_APP_PASSWORD'),
            },
        });
    }

    async sendVerificationOTP(email: string, otp: string) {
        this.logOTPTerminal(email, otp, 'VERIFICATION CODE');

        const mailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: email,
            subject: 'Account Verification - EventTix',
            html: `
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
      `,
        };

        return this.sendMail(mailOptions);
    }

    async sendPasswordResetOTP(email: string, otp: string) {
        this.logOTPTerminal(email, otp, 'PASSWORD RESET CODE');

        const mailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: email,
            subject: 'Password Reset OTP - EventTix',
            html: `
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
      `,
        };

        return this.sendMail(mailOptions);
    }

    private async sendMail(mailOptions: nodemailer.SendMailOptions) {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.warn('⚠️ Email sending failed:', error.message);
            return { success: true, fallback: true, error: error.message };
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
