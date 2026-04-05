import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import './Auth.css';

const SignIn = () => {
    const [step, setStep] = useState('password');
    const [role, setRole] = useState('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugOtp, setDebugOtp] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!email || !password || !role) {
            setError('Email, password, and role are required.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password, role });
            const { token, name, role: userRole, id, profileImageUrl } = response.data;

            login({ name, role: userRole, id, profileImageUrl, email }, token);

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!email || !role) {
            setError('Email and role are required for OTP login.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/request-otp', { email, role });
            setStatus('OTP sent to your email. It is valid for 10 minutes.');
            setDebugOtp(response.data.demoOtp || '');
            setStep('otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!otp || !email || !role) {
            setError('Email, role, and OTP are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email, role, otp });
            const { token, name, role: userRole, id, profileImageUrl } = response.data;

            login({ name, role: userRole, id, profileImageUrl, email }, token);

            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setStatus('');
        setLoading(true);
        try {
            const response = await api.post('/auth/request-otp', { email, role });
            setStatus('A new OTP was sent to your email.');
            setDebugOtp(response.data.demoOtp || '');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Robot Visual */}
            <div className="robot-visual">
                <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
                    {/* Robot Body */}
                    <g className="robot-body">
                        {/* Head */}
                        <g className="robot-head">
                            <rect x="60" y="20" width="80" height="80" fill="#D84315" rx="8" strokeWidth="2" stroke="#B71C1C" />
                            {/* Eyes */}
                            <circle cx="80" cy="50" r="8" fill="#FFB74D" />
                            <circle cx="120" cy="50" r="8" fill="#FFB74D" />
                            {/* Eye shine */}
                            <circle cx="82" cy="48" r="3" fill="white" />
                            <circle cx="122" cy="48" r="3" fill="white" />
                            {/* Mouth */}
                            <path d="M 80 70 Q 100 78 120 70" stroke="#B71C1C" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>

                        {/* Neck */}
                        <rect x="85" y="100" width="30" height="15" fill="#A1887F" />

                        {/* Body/Torso */}
                        <rect x="50" y="115" width="100" height="90" fill="#FF8A65" rx="8" strokeWidth="2" stroke="#D84315" />

                        {/* Chest panel */}
                        <rect x="65" y="130" width="70" height="50" fill="#FFB74D" rx="4" opacity="0.6" />
                        {/* Chest details */}
                        <circle cx="85" cy="155" r="4" fill="#D84315" />
                        <circle cx="100" cy="155" r="4" fill="#D84315" />
                        <circle cx="115" cy="155" r="4" fill="#D84315" />

                        {/* Left Arm */}
                        <g className="robot-arm-left">
                            <rect x="20" y="130" width="30" height="20" fill="#FF7043" rx="4" strokeWidth="1" stroke="#D84315" />
                            {/* Left Hand */}
                            <circle cx="15" cy="140" r="12" fill="#A1887F" strokeWidth="1" stroke="#8D6E63" />
                            <circle cx="12" cy="135" r="3" fill="#8D6E63" />
                            <circle cx="12" cy="145" r="3" fill="#8D6E63" />
                            <circle cx="18" cy="132" r="3" fill="#8D6E63" />
                            <circle cx="18" cy="148" r="3" fill="#8D6E63" />
                        </g>

                        {/* Right Arm */}
                        <g className="robot-arm-right">
                            <rect x="150" y="130" width="30" height="20" fill="#FF7043" rx="4" strokeWidth="1" stroke="#D84315" />
                            {/* Right Hand */}
                            <circle cx="185" cy="140" r="12" fill="#A1887F" strokeWidth="1" stroke="#8D6E63" />
                            <circle cx="188" cy="135" r="3" fill="#8D6E63" />
                            <circle cx="188" cy="145" r="3" fill="#8D6E63" />
                            <circle cx="182" cy="132" r="3" fill="#8D6E63" />
                            <circle cx="182" cy="148" r="3" fill="#8D6E63" />
                        </g>

                        {/* Left Leg */}
                        <rect x="65" y="205" width="20" height="60" fill="#FF7043" rx="4" strokeWidth="1" stroke="#D84315" />
                        {/* Left Foot */}
                        <ellipse cx="75" cy="268" rx="14" ry="8" fill="#8D6E63" strokeWidth="1" stroke="#654321" />

                        {/* Right Leg */}
                        <rect x="115" y="205" width="20" height="60" fill="#FF7043" rx="4" strokeWidth="1" stroke="#D84315" />
                        {/* Right Foot */}
                        <ellipse cx="125" cy="268" rx="14" ry="8" fill="#8D6E63" strokeWidth="1" stroke="#654321" />

                        {/* Power indicator lights */}
                        <circle cx="85" cy="190" r="4" fill="#4CAF50" opacity="0.8" />
                        <circle cx="115" cy="190" r="4" fill="#4CAF50" opacity="0.8" />
                    </g>
                </svg>
            </div>

            <div className="auth-card">
                <h2>Sign In</h2>

                {step === 'password' && (
                    <form onSubmit={handlePasswordLogin}>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group password-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {status && <div className="otp-info">{status}</div>}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Signing In...' : 'Login with Password'}
                        </button>

                        <button
                            type="button"
                            className="auth-button secondary"
                            onClick={handleSendOtp}
                            disabled={loading}
                            style={{ marginTop: '12px' }}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} disabled />
                        </div>
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength="6"
                                disabled={loading}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {status && <div className="otp-info">{status}</div>}
                        {debugOtp && (
                            <p className="otp-info" style={{ marginTop: '12px' }}>
                                Demo OTP: <strong>{debugOtp}</strong>
                            </p>
                        )}

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            className="auth-button secondary"
                            onClick={handleResendOtp}
                            disabled={loading}
                            style={{ marginTop: '12px' }}
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Don&apos;t have an account?{' '}
                        <a onClick={() => navigate('/signup')} style={{ cursor: 'pointer', color: '#007bff' }}>
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
