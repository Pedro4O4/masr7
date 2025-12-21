import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendVerificationOTP(email: string, otp: string): Promise<{
        success: boolean;
        messageId: any;
        fallback?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        fallback: boolean;
        error: any;
        messageId?: undefined;
    }>;
    sendPasswordResetOTP(email: string, otp: string): Promise<{
        success: boolean;
        messageId: any;
        fallback?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        fallback: boolean;
        error: any;
        messageId?: undefined;
    }>;
    private sendMail;
    private logOTPTerminal;
}
