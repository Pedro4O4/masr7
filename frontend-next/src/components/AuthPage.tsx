"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import api from "@/services/api";
import './AuthPage.css';

interface AuthPageProps {
    initialSide?: 'login' | 'register';
}

export default function AuthPage({ initialSide = 'login' }: AuthPageProps) {
    const [isRegisterSide, setIsRegisterSide] = useState(initialSide === 'register');
    const router = useRouter();
    const { login } = useAuth();

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [showLoginOtp, setShowLoginOtp] = useState(false);
    const [loginOtp, setLoginOtp] = useState(['', '', '', '', '', '']);
    const [loginVerifyLoading, setLoginVerifyLoading] = useState(false);

    const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", role: "Standard User" });
    const [registerError, setRegisterError] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);
    const [showRegisterOtp, setShowRegisterOtp] = useState(false);
    const [registerOtp, setRegisterOtp] = useState(['', '', '', '', '', '']);
    const [registerVerifyLoading, setRegisterVerifyLoading] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (typeof window === 'undefined') return;
        const windowWidth = window.innerWidth;
        const mouseX = e.clientX;
        if (mouseX > windowWidth * 0.6) setIsRegisterSide(true);
        else if (mouseX < windowWidth * 0.4) setIsRegisterSide(false);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value && !/^\d*$/.test(value)) return;
        const newOtp = [...loginOtp];
        newOtp[index] = value.substring(0, 1);
        setLoginOtp(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`login-otp-${index + 1}`);
            if (nextInput) (nextInput as HTMLInputElement).focus();
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");
        try {
            const result = await login(loginData) as any;
            if (result.success) {
                toast.success("Login successful!");
                router.push("/events");
            } else if (result.requiresPasswordChange) {
                // Admin-created user needs to set their own password
                toast.info("Please set your own password");
                router.push(`/set-password?email=${encodeURIComponent(result.email)}`);
            } else if (result.requiresVerification) {
                toast.info("Please verify your account with the code sent to your email");
                setShowLoginOtp(true);
            } else {
                setLoginError(result.error || "Login failed");
                toast.error(result.error || "Login failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLoginVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginVerifyLoading(true);
        const otpString = loginOtp.join('');
        try {
            await api.post("/auth/verify-registration", { email: loginData.email, otp: otpString });
            toast.success("Account verified successfully!");
            setShowLoginOtp(false);
            const result = await login(loginData);
            if (result.success) router.push("/events");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Verification failed";
            setLoginError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoginVerifyLoading(false);
        }
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRegisterOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value && !/^\d*$/.test(value)) return;
        const newOtp = [...registerOtp];
        newOtp[index] = value.substring(0, 1);
        setRegisterOtp(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`register-otp-${index + 1}`);
            if (nextInput) (nextInput as HTMLInputElement).focus();
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError("");
        try {
            await api.post("/auth/register", registerData);
            toast.success("Verification code sent to your email");
            setShowRegisterOtp(true);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Registration failed";
            setRegisterError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterVerifyLoading(true);
        const otpString = registerOtp.join('');
        try {
            await api.post("/auth/verify-registration", { email: registerData.email, otp: otpString });
            toast.success("Registration successful! Redirecting to login...");
            setShowRegisterOtp(false);
            setIsRegisterSide(false);
            setTimeout(() => setLoginData({ email: registerData.email, password: "" }), 1000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Verification failed";
            setRegisterError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setRegisterVerifyLoading(false);
        }
    };

    return (
        <div className="auth-page" onMouseMove={handleMouseMove}>
            <div className="auth-background">
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <div className="bg-shape bg-shape-3"></div>
            </div>

            <div className={`auth-panel auth-panel-left ${!isRegisterSide ? 'active' : ''}`}>
                <div className="auth-content">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue your journey</p>
                    {loginError && <div className="error-message">{loginError}</div>}
                    {!showLoginOtp ? (
                        <form onSubmit={handleLoginSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" placeholder="Enter your email" className="form-input" value={loginData.email} onChange={handleLoginChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" placeholder="Enter your password" className="form-input" value={loginData.password} onChange={handleLoginChange} required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loginLoading}>
                                {loginLoading ? <><span className="form-loader"></span> Signing In...</> : 'Sign In'}
                            </button>
                            <div className="auth-links">
                                <Link href="/forgot-password" title="Forgot Password?" className="auth-link">Forgot Password?</Link>
                            </div>
                        </form>
                    ) : (
                        <div className="otp-container">
                            <p className="otp-text">Enter verification code</p>
                            <form onSubmit={handleLoginVerifyOtp} className="otp-form-inline">
                                <div className="otp-inputs">
                                    {loginOtp.map((digit, index) => (
                                        <input key={index} id={`login-otp-${index}`} type="text" className="otp-input" maxLength={1} value={digit} onChange={(e) => handleLoginOtpChange(e, index)} autoFocus={index === 0} />
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary" disabled={loginVerifyLoading || loginOtp.some(digit => !digit)}>
                                    {loginVerifyLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className={`auth-panel auth-panel-right ${isRegisterSide ? 'active' : ''}`}>
                <div className="auth-content">
                    <h1 className="auth-title">Join Us Today</h1>
                    <p className="auth-subtitle">Create an account to get started</p>
                    {registerError && <div className="error-message">{registerError}</div>}
                    {!showRegisterOtp ? (
                        <form onSubmit={handleRegisterSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="name" placeholder="Enter your full name" className="form-input" value={registerData.name} onChange={handleRegisterChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" placeholder="Enter your email" className="form-input" value={registerData.email} onChange={handleRegisterChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" placeholder="Create a secure password" className="form-input" value={registerData.password} onChange={handleRegisterChange} required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={registerLoading}>
                                {registerLoading ? <><span className="form-loader"></span> Creating Account...</> : 'Join Now'}
                            </button>
                        </form>
                    ) : (
                        <div className="otp-container">
                            <p className="otp-text">Enter verification code</p>
                            <form onSubmit={handleRegisterVerifyOtp} className="otp-form-inline">
                                <div className="otp-inputs">
                                    {registerOtp.map((digit, index) => (
                                        <input key={index} id={`register-otp-${index}`} type="text" className="otp-input" maxLength={1} value={digit} onChange={(e) => handleRegisterOtpChange(e, index)} autoFocus={index === 0} />
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary" disabled={registerVerifyLoading || registerOtp.some(digit => !digit)}>
                                    {registerVerifyLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="side-indicators">
                <div className={`indicator indicator-left ${!isRegisterSide ? 'active' : ''}`}><span>Login</span></div>
                <div className={`indicator indicator-right ${isRegisterSide ? 'active' : ''}`}><span>Register</span></div>
            </div>
        </div>
    );
}
