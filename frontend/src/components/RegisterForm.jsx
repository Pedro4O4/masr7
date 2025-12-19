import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterForm.css";

export default function RegisterForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Standard User",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // New states for OTP verification
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("http://localhost:3000/api/v1/register", form);
            toast.success("Verification code sent to your email");
            setShowOtpForm(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        // Only allow numbers
        if (value && !/^\d*$/.test(value)) return;

        // Update OTP state
        const newOtp = [...otp];
        newOtp[index] = value.substring(0, 1); // Only take first character
        setOtp(newOtp);

        // Auto-focus next input if value is entered
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setVerifyLoading(true);
        setError("");

        const otpString = otp.join('');

        try {
            await axios.post("http://localhost:3000/api/v1/verify-otp-register", {
                email: form.email,
                otp: otpString
            });

            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Verification failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setVerifyLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="login-card">
                <div className="card-decoration"></div>
                <h1 className="login-title">{showOtpForm ? "Verify Your Email" : "Join the Theater"}</h1>

                {error && <div className="error-message">{error}</div>}

                {!showOtpForm ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="form-input"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="input-icon fas fa-user"></i>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">Email Address</span>
                            </label>
                            <div className="input-container">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="form-input"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="input-icon fas fa-envelope"></i>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">Password</span>
                            </label>
                            <div className="input-container">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a secure password"
                                    className="form-input"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="input-icon fas fa-lock"></i>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <span className="label-text">Account Type</span>
                            </label>
                            <div className="input-container">
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="Standard User">Standard User</option>
                                    <option value="Organizer">Organizer</option>
                                </select>
                                <i className="input-icon fas fa-user-tag"></i>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="form-loader"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>Join Now</>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="otp-form-container">
                        <form className="otp-form" onSubmit={handleVerifyOtp}>
                            <div className="content">
                                <p style={{ textAlign: "center" }}>Enter verification code</p>
                                <div className="inp">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            className="input"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e, index)}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    className="verify-btn"
                                    disabled={verifyLoading || otp.some(digit => !digit)}
                                >
                                    {verifyLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                            <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <path className="path" d="M58 29.2C61.3 28.8 63.3 32.5 61.8 35.4C60.4 38.2 56.6 38.4 54.7 35.9C52.8 33.3 54.7 29.6 58 29.2Z" fill="#369eff"></path>
                            </svg>
                        </form>
                    </div>
                )}

                <div className="redirect-link">
                    <div>Already part of our community? <Link to="/login">Sign In</Link></div>
                </div>
            </div>
        </div>
    );
}