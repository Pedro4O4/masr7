import { AuthService } from './auth.service';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    verifyRegistration(email: string, otp: string): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    login(loginDto: any, res: Response): Promise<{
        success: boolean;
        data: {
            message: string;
            token: string;
            user: {
                _id: import("mongoose").Types.ObjectId;
                name: string;
                email: string;
                role: string;
                profilePicture: string | undefined;
            };
        };
    }>;
    logout(res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    forgetPassword(email: string): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    resetPassword(resetDto: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    verifyOtp(resetDto: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
    submitNewPassword(submitDto: any): Promise<{
        success: boolean;
        data: {
            message: string;
            email: any;
        };
    }>;
    verifyAndActivate(verifyDto: any, res: Response): Promise<{
        success: boolean;
        data: {
            message: string;
            token: string;
            user: {
                _id: import("mongoose").Types.ObjectId;
                name: string;
                email: string;
                role: string;
                profilePicture: string | undefined;
            };
        };
    }>;
}
