import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ForgotPasswordForm.css';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([]);

    // Handle OTP input and auto-focus to next input
    const handleOtpChange = (index, value) => {
        if (value.length <= 1) {
            const newOtpDigits = [...otpDigits];
            newOtpDigits[index] = value;
            setOtpDigits(newOtpDigits);

            // Auto focus to next input
            if (value && index < 3) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    // Handle backspace to go to previous input
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.put(
                'http://localhost:3000/api/v1/forgetPassword',
                { email }
            );

            setSuccess(response.data.message || 'Verification code sent to your email');
            setStep(2);
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const otp = otpDigits.join('');

        if (!otp || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/verify-otp',
                { email, otp, newPassword }
            );

            setSuccess(response.data.message || 'Password reset successfully');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Focus first input when OTP form appears
    useEffect(() => {
        if (step === 2) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [step]);

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Reset Password</h2>
                {step === 1 ? (
                    <p className="redirect-link">
                        Enter your email address to receive a verification code.
                    </p>
                ) : (
                    <p className="redirect-link">
                        Enter the verification code sent to your email and your new password.
                    </p>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <div className="otp-form-container">
                            <form className="otp-form">
                                <div className="content">
                                    <p align="center">OTP Verification</p>
                                    <div className="inp">
                                        {[0, 1, 2, 3 ,4, 5].map((i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                className="input"
                                                maxLength="1"
                                                value={otpDigits[i]}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(i, e)}
                                                ref={(el) => (inputRefs.current[i] = el)}
                                            />
                                        ))}
                                    </div>
                                    <svg className="svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#4073ff" d="M56.8,-23.9C61.7,-3.2,45.7,18.8,26.5,31.7C7.2,44.6,-15.2,48.2,-35.5,36.5C-55.8,24.7,-73.9,-2.6,-67.6,-25.2C-61.3,-47.7,-30.6,-65.6,-2.4,-64.8C25.9,-64.1,51.8,-44.7,56.8,-23.9Z" transform="translate(100 100)" className="path"></path>
                                    </svg>
                                </div>
                            </form>
                        </div>

                        <form onSubmit={handleResetPassword} className="password-reset-form">
                            <div className="form-group">
                                <label htmlFor="newPassword" className="form-label">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="form-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="verify-btn"
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="redirect-link">
                    <Link to="/login">Return to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;