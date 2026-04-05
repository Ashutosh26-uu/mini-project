import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import './AdminManagement.css';

const AdminManagement = () => {
    const [activeTab, setActiveTab] = useState('pending-admins');
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [adminRes, usersRes] = await Promise.all([
                api.get('/admin/pending-admins', { headers }),
                api.get('/admin/users', { headers }),
            ]);

            setPendingAdmins(adminRes.data.pendingAdmins || []);
            setUsers(usersRes.data.users || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAdmins = async () => {
        setLoading(true);
        setError('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await api.get('/admin/all-admins', { headers });
            setAllAdmins(res.data.admins || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load admins.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAdmin = async (id) => {
        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await api.post(`/admin/approve-admin/${id}`, {}, { headers });
            setStatus('Admin approved successfully.');
            setPendingAdmins(pendingAdmins.filter((a) => a.id !== id));
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDenyAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to deny this admin request?')) {
            return;
        }

        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await api.post(`/admin/deny-admin/${id}`, {}, { headers });
            setStatus('Admin request denied.');
            setPendingAdmins(pendingAdmins.filter((a) => a.id !== id));
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to deny admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableUser = async (id) => {
        if (!window.confirm('Are you sure you want to disable this user?')) {
            return;
        }

        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await api.post(`/admin/disable-user/${id}`, {}, { headers });
            setStatus('User disabled successfully.');
            setUsers(users.map((u) => (u.id === id ? { ...u, disabled: true } : u)));
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable user.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnableUser = async (id) => {
        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await api.post(`/admin/enable-user/${id}`, {}, { headers });
            setStatus('User enabled successfully.');
            setUsers(users.map((u) => (u.id === id ? { ...u, disabled: false } : u)));
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enable user.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisableAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to disable this admin?')) {
            return;
        }

        setLoading(true);
        setError('');
        setStatus('');

        try {
            const headers = { Authorization: `Bearer ${token}` };
            await api.post(`/admin/disable-admin/${id}`, {}, { headers });
            setStatus('Admin disabled successfully.');
            setAllAdmins(allAdmins.map((a) => (a.id === id ? { ...a, account_status: 'DISABLED' } : a)));
            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="admin-management-container">
            <div className="admin-management-header">
                <h1>Admin Management</h1>
                <button className="logout-button" onClick={handleLogout}>
                    Sign Out
                </button>
            </div>

            <div className="admin-tabs">
                <button
                    className={`tab-button ${activeTab === 'pending-admins' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('pending-admins');
                        fetchData();
                    }}
                >
                    Pending Admin Requests ({pendingAdmins.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'all-admins' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('all-admins');
                        fetchAllAdmins();
                    }}
                >
                    All Admins
                </button>
                <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('users');
                        fetchData();
                    }}
                >
                    Users ({users.length})
                </button>
            </div>

            {status && <div className="status-message">{status}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="admin-content">
                {loading && <div className="loading-spinner">Loading...</div>}

                {activeTab === 'pending-admins' && (
                    <div className="admin-section">
                        <h2>Pending Admin Requests</h2>
                        {pendingAdmins.length === 0 ? (
                            <p className="empty-message">No pending admin requests.</p>
                        ) : (
                            <div className="admin-list">
                                {pendingAdmins.map((admin) => (
                                    <div key={admin.id} className="admin-item">
                                        <div className="admin-info">
                                            <h3>{admin.full_name}</h3>
                                            <p>{admin.email}</p>
                                            <p className="timestamp">
                                                Requested: {new Date(admin.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="admin-actions">
                                            <button
                                                className="btn-approve"
                                                onClick={() => handleApproveAdmin(admin.id)}
                                                disabled={loading}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn-deny"
                                                onClick={() => handleDenyAdmin(admin.id)}
                                                disabled={loading}
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'all-admins' && (
                    <div className="admin-section">
                        <h2>All Admins</h2>
                        {allAdmins.length === 0 ? (
                            <p className="empty-message">No admins found.</p>
                        ) : (
                            <div className="admin-list">
                                {allAdmins.map((admin) => (
                                    <div key={admin.id} className="admin-item">
                                        <div className="admin-info">
                                            <h3>{admin.full_name}</h3>
                                            <p>{admin.email}</p>
                                            <p className="status-badge" style={{
                                                color: admin.account_status === 'ACTIVE' ? '#28a745' : admin.account_status === 'DISABLED' ? '#dc3545' : '#ffc107'
                                            }}>
                                                Status: {admin.account_status}
                                            </p>
                                            <p className="timestamp">
                                                Joined: {new Date(admin.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {admin.account_status === 'ACTIVE' && (
                                            <div className="admin-actions">
                                                <button
                                                    className="btn-disable"
                                                    onClick={() => handleDisableAdmin(admin.id)}
                                                    disabled={loading}
                                                >
                                                    Disable
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="admin-section">
                        <h2>Users</h2>
                        {users.length === 0 ? (
                            <p className="empty-message">No users found.</p>
                        ) : (
                            <div className="admin-list">
                                {users.map((user) => (
                                    <div key={user.id} className="admin-item">
                                        <div className="admin-info">
                                            <h3>{user.full_name}</h3>
                                            <p>{user.email}</p>
                                            {user.disabled_at && (
                                                <p className="status-badge" style={{ color: '#dc3545' }}>
                                                    Status: Disabled
                                                </p>
                                            )}
                                            <p className="timestamp">
                                                Joined: {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="admin-actions">
                                            {!user.disabled_at ? (
                                                <button
                                                    className="btn-disable"
                                                    onClick={() => handleDisableUser(user.id)}
                                                    disabled={loading}
                                                >
                                                    Disable
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-enable"
                                                    onClick={() => handleEnableUser(user.id)}
                                                    disabled={loading}
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagement;
