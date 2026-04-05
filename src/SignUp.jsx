import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './Auth.css';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                fullName,
                email,
                password,
                role,
            });

            setStatus(response.data.message);
            setTimeout(() => {
                navigate('/signin');
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                <h2>Create Account</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={loading}
                        />
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

                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
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
                            <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {status && <div className="otp-info">{status}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <a onClick={() => navigate('/signin')} style={{ cursor: 'pointer', color: '#007bff' }}>
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
