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
