import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';
import CodeExplainer from './CodeExplainer';
import AdminDashboard from './AdminDashboard';
import AdminManagement from './AdminManagement';
import UserDashboard from './UserDashboard';
import './Auth.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-card">
                    <div className="loading-title">Loading...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPrompt />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <UnauthorizedPrompt userRole={user.role} />;
    }

    return children;
};

// Login Prompt Component (shown when trying to access without login)
const LoginPrompt = () => {
    const navigate = useNavigate();

    return (
        <div className="login-prompt-shell">
            <div className="login-prompt-card">
                <div className="login-prompt-icon">🔐</div>
                <h1>Access Required</h1>
                <p>
                    To use the Code Explainer, please <strong>sign in</strong> first.
                    <br />
                    You can also create a new account if you don&apos;t have one.
                </p>
                <div className="login-prompt-actions">
                    <button onClick={() => navigate('/signin')}>Sign In</button>
                    <button className="secondary" onClick={() => navigate('/signup')}>
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const UnauthorizedPrompt = ({ userRole }) => {
    const navigate = useNavigate();

    const targetPath = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';

    return (
        <div className="login-prompt-shell">
            <div className="login-prompt-card">
                <div className="login-prompt-icon">🚫</div>
                <h1>Unauthorized</h1>
                <p>
                    Your account role <strong>{userRole}</strong> does not have access to this page.
                    <br />
                    Please use the correct dashboard or sign in with a different account.
                </p>
                <div className="login-prompt-actions">
                    <button onClick={() => navigate(targetPath)}>Go to Dashboard</button>
                    <button className="secondary" onClick={() => navigate('/')}>Return Home</button>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="app-shell">
            <nav>
                <a className="nav-logo" href="#home">
                    CodeExplainer<span>AI</span>
                </a>
                <ul className="nav-links">
                    <li>
                        <a href="#home">Home</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                    <li>
                        <a href="#login">Login</a>
                    </li>
                </ul>
                <button className="nav-button" onClick={() => navigate('/signin')}>
                    Sign In
                </button>
            </nav>

            <main>
                <section id="home">
                    <div className="hero-glow" />
                    <span className="hero-tag">AI CODE EXPLAINER</span>
                    <h1 className="hero-title">
                        Build faster with smart code explanations.
                    </h1>
                    <p className="hero-subtitle">
                        Learn what your code does, fix bugs quicker, and understand complex logic with an AI-powered code explainer.
                    </p>
                    <div>
                        <button className="hero-cta" onClick={() => navigate('/signin')}>
                            Get Started
                        </button>
                    </div>
                </section>

                <section id="about">
                    <div className="section-label">About Us</div>
                    <h2 className="section-title">A smarter way to learn and maintain code</h2>
                    <p className="section-sub">
                        CodeExplainer AI helps developers of all levels understand code faster, reduce debugging time, and improve productivity by giving clear, human-friendly explanations.
                    </p>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>Instant explanations</h3>
                            <p>Paste or upload code and get easy-to-read breakdowns in seconds.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Beginner-friendly</h3>
                            <p>Learn the intent behind functions, loops, and logic without guessing.</p>
                        </div>
                        <div className="feature-card">
                            <h3>Secure access</h3>
                            <p>Sign in safely, save progress, and return to your explanations anytime.</p>
                        </div>
                    </div>
                </section>

                <section id="login">
                    <div className="section-label">Login</div>
                    <h2 className="section-title">Access your personalized workspace</h2>
                    <p className="section-sub">
                        Sign in to open the code explainer dashboard or register for a new account to start learning immediately.
                    </p>
                    <div className="cta-grid">
                        <button className="hero-cta" onClick={() => navigate('/signin')}>
                            Sign In
                        </button>
                        <button className="hero-cta secondary" onClick={() => navigate('/signup')}>
                            Create Account
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

// Main App Component with Routing
function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute>
                                <CodeExplainer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/management"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/user/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
