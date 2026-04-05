import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>User Dashboard</h2>
                <p>Welcome back, {user?.name || 'User'}.</p>
                <p>Access your code explanations, saved sessions, and learning tools here.</p>
                <button className="auth-button" onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default UserDashboard;
