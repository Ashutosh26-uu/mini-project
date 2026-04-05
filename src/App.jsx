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
                        <a href="#team">Team</a>
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

                <section id="team">
                    <div className="section-label">Our Team</div>
                    <h2 className="section-title">Built by developers, for developers</h2>
                    <p className="section-sub">
                        CodeExplainer AI is developed by passionate engineers dedicated to making code more understandable and accessible to everyone.
                    </p>
                    <div className="team-grid">
                        <div className="team-card">
                            <div className="team-avatar">A</div>
                            <h3>Ashutosh Mishra</h3>
                            <p>Full Stack Developer</p>
                            <p className="team-bio">Passionate about building tools that help developers learn and grow faster.</p>
                        </div>
                        <div className="team-card">
                            <div className="team-avatar">C</div>
                            <h3>CodeExplainer Team</h3>
                            <p>Open Source Contributors</p>
                            <p className="team-bio">Part of an amazing community committed to improving developer experience.</p>
                        </div>
                        <div className="team-card">
                            <div className="team-avatar">Y</div>
                            <h3>You?</h3>
                            <p>Community Developer</p>
                            <p className="team-bio">Join us in making CodeExplainer better. We're always looking for contributors!</p>
                        </div>
                    </div>
                </section>

                <footer>
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4>CodeExplainer AI</h4>
                            <p>Making code understandable for everyone.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Contact</h4>
                            <p>
                                Email: <a href="mailto:ashutosh26.dev@gmail.com">ashutosh26.dev@gmail.com</a>
                            </p>
                            <p>
                                GitHub: <a href="https://github.com/Ashutosh26-uu" target="_blank" rel="noopener noreferrer">
                                    Ashutosh26-uu
                                </a>
                            </p>
                        </div>
                        <div className="footer-section">
                            <h4>Project Repository</h4>
                            <a href="https://github.com/Ashutosh26-uu/mini-project" target="_blank" rel="noopener noreferrer" className="github-link">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View on GitHub
                            </a>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <p>
                                <a href="#home">Home</a> • <a href="#about">About</a> • <a href="#team">Team</a>
                            </p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 CodeExplainer AI. All rights reserved. | Designed for developers by developers.</p>
                    </div>
                </footer>
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
