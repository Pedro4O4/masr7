import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import './LoginForm.css';


export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // States for OTP verification
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;

        // Only allow numbers
        if (value && !/^\d*$/.test(value)) return;

        // Update OTP state
        const newOtp = [...otp];
        newOtp[index] = value.substring(0, 1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(formData);

            if (result.success) {
                toast.success("Login successful!");
                console.log("Successfully logged in admin");
                console.log(result.user.role);
                navigate("/events");
            } else if (result.requiresVerification) {
                // Show OTP form if verification is required
                toast.info("Please verify your account with the code sent to your email");
                setShowOtpForm(true);
            } else {
                toast.error(result.error || "Login failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setVerifyLoading(true);
        setError("");

        const otpString = otp.join('');

        try {
            // Fix the unused variable warning by not assigning to 'response'
            await axios.post("http://localhost:3000/api/v1/verify-otp-register", {
                email: formData.email,
                otp: otpString
            });

            toast.success("Account verified successfully!");
            setShowOtpForm(false);

            // Try logging in again
            const result = await login(formData);
            if (result.success) {
                navigate("/events");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Verification failed";
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
                <h1 className="login-title">{showOtpForm ? "Verify Your Account" : "Welcome Back"}</h1>

                {error && <div className="error-message">{error}</div>}

                {!showOtpForm ? (
                    <form onSubmit={handleSubmit}>
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
                                    value={formData.email}
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
                                    placeholder="Enter your password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="input-icon fas fa-lock"></i>
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
                                    Signing In...
                                </>
                            ) : (
                                <>Sign In</>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="otp-form-container">
                        <form className="otp-form" onSubmit={handleVerifyOtp}>
                            <div className="content">
                                <p>Enter verification code</p>
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
                                <p style={{ textAlign: "center", marginTop: "10px", fontSize: "0.8rem" }}>
                                    <a
                                        href="#"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            try {
                                                toast.info("Requesting new verification code...");

                                                try {
                                                    // The login endpoint will return 403 for unverified accounts
                                                    await axios.post("http://localhost:3000/api/v1/login", {
                                                        email: formData.email,
                                                        password: formData.password
                                                    }, {
                                                        withCredentials: true
                                                    });
                                                } catch (err) {
                                                    // If it's a 403 verification required error, this is actually what we want
                                                    if (err.response?.status === 403 &&
                                                        err.response?.data?.message?.includes("verification")) {
                                                        toast.success("New verification code sent to your email");
                                                        return;
                                                    }
                                                    throw err; // Re-throw if it's a different error
                                                }

                                                toast.success("New verification code sent to your email");
                                            } catch (error) {
                                                console.error("Error resending code:", error);
                                                toast.error("Failed to resend verification code");
                                            }
                                        }}
                                        style={{ color: "var(--primary)", textDecoration: "underline" }}
                                    >
                                        Didn't receive a code? Resend
                                    </a>
                                </p>
                            </div>
                            <svg className="svg" xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <path className="path" d="M58 29.2C61.3 28.8 63.3 32.5 61.8 35.4C60.4 38.2 56.6 38.4 54.7 35.9C52.8 33.3 54.7 29.6 58 29.2Z" fill="var(--primary)"></path>
                            </svg>
                        </form>
                    </div>
                )}

                <div className="redirect-link">
                    <div>Don't have an account? <Link to="/register">Register</Link></div>
                    <div>Forgot your password? <Link to="/forgot-password">Reset Password</Link></div>
                </div>
            </div>
        </div>
    );
}