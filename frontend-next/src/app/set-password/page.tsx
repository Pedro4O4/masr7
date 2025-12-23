"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiAlertCircle, FiMail, FiShield } from 'react-icons/fi';
import api from '@/services/api';
import { toast } from 'react-toastify';

type Step = 'password' | 'otp';

const SetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<Step>('password');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            router.push('/login');
        }
    }, [searchParams, router]);

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword) {
            setError('Password is required');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/submit-password', {
                email,
                newPassword
            });

            if (response.data.success) {
                toast.success('Password saved! Please verify with OTP.');
                setStep('otp');
            }
        } catch (err: any) {
            console.error('Error submitting password:', err);
            setError(err.response?.data?.message || 'Failed to submit password');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/verify-activate', {
                email,
                otp
            });

            if (response.data.success) {
                toast.success('Account activated! Redirecting...');

                // Backend already sets the cookie, we just need to redirect
                const userRole = response.data.data.user.role;

                // Give time for cookie to be set, then reload to fresh state
                setTimeout(() => {
                    if (userRole === 'System Admin') {
                        window.location.href = '/admin/users';
                    } else if (userRole === 'Organizer') {
                        window.location.href = '/my-events';
                    } else {
                        window.location.href = '/events';
                    }
                }, 1000);
            }
        } catch (err: any) {
            console.error('Error verifying OTP:', err);
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    padding: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        {step === 'password' ? <FiLock size={28} color="white" /> : <FiShield size={28} color="white" />}
                    </div>
                    <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                        {step === 'password' ? 'Set Your Password' : 'Verify Your Email'}
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                        {step === 'password'
                            ? 'Create a secure password for your account'
                            : 'Enter the verification code sent to your email'
                        }
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444'
                        }}
                    >
                        <FiAlertCircle />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Email Display */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '10px',
                    marginBottom: '1.5rem'
                }}>
                    <FiMail style={{ color: '#667eea' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{email}</span>
                </div>

                {step === 'password' ? (
                    <form onSubmit={handleSubmitPassword} autoComplete="on">
                        {/* Hidden email field for browser password manager */}
                        <input type="hidden" name="email" value={email} autoComplete="username" />

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                autoComplete="new-password"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                autoComplete="new-password"
                                style={inputStyle}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: loading ? 'rgba(102, 126, 234, 0.5)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </motion.button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} autoComplete="off">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                Verification Code
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                style={{
                                    ...inputStyle,
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem'
                                }}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: loading ? 'rgba(102, 126, 234, 0.5)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? 'Verifying...' : (
                                <>
                                    <FiCheck />
                                    Activate Account
                                </>
                            )}
                        </motion.button>
                    </form>
                )}

                {/* Step Indicator */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '4px',
                        borderRadius: '2px',
                        background: step === 'password' ? '#667eea' : 'rgba(102, 126, 234, 0.3)'
                    }} />
                    <div style={{
                        width: '40px',
                        height: '4px',
                        borderRadius: '2px',
                        background: step === 'otp' ? '#667eea' : 'rgba(102, 126, 234, 0.3)'
                    }} />
                </div>
            </motion.div>
        </div>
    );
};

const SetPasswordPage = () => {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: 'white'
            }}>
                Loading...
            </div>
        }>
            <SetPasswordContent />
        </Suspense>
    );
};

export default SetPasswordPage;
