import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Admin Dashboard</h2>
                <p>Welcome back, {user?.name || 'Administrator'}.</p>
                <p>Use the admin dashboard to manage users and view system status.</p>
                <button className="auth-button" onClick={() => navigate('/admin/management')}>
                    Manage Users & Admins
                </button>
                <button className="auth-button secondary" style={{ marginTop: '12px' }} onClick={handleLogout}>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
