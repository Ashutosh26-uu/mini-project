# CodeExplainer AI

A modern web application for AI-powered code explanation with user authentication, role-based access control, and admin management system.

![CodeExplainer AI](https://img.shields.io/badge/CodeExplainer-AI-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=flat&logo=json-web-tokens)

## 🌟 Features

### 🔐 Authentication & Authorization

- **User Registration & Login** - Secure user accounts with password hashing
- **OTP Authentication** - Email-based OTP verification (10-minute expiry)
- **Role-Based Access Control** - User and Admin roles with different permissions
- **JWT Token Management** - Secure session management
- **Admin Approval Workflow** - Admin accounts require approval before activation

### 👥 User Management

- **Admin Dashboard** - Manage users and admin requests
- **User Disable/Enable** - Soft delete functionality for user accounts
- **Profile Management** - User profile information and settings

### 🤖 AI Code Explanation

- **Interactive Code Editor** - Monaco Editor integration
- **AI-Powered Explanations** - Clear, human-friendly code explanations
- **Multiple Programming Languages** - Support for various languages
- **Real-time Analysis** - Instant code analysis and feedback

### 🎨 Modern UI/UX

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Autumn Theme** - Beautiful animated login page with robot visuals
- **Smooth Animations** - CSS animations and transitions
- **Dark/Light Mode Ready** - Extensible theme system

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with animations

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email sending (OTP)

### Development Tools

- **ESLint** - Code linting
- **Git** - Version control
- **npm** - Package management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL Server** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download](https://git-scm.com/)

### Optional (for email functionality)

- **Gmail Account** (for OTP emails) or any SMTP provider

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ashutosh26-uu/mini-project.git
cd mini-project
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Database Setup

#### Install MySQL Server

1. Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. During installation, set up a root user (remember the password)
3. Start MySQL service

#### Create Database

```bash
# Open MySQL command line or MySQL Workbench
mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE code_explainer;

-- Use the database
USE code_explainer;

-- Create tables (copy from backend/sql/schema.sql)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(512),
    disabled_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(512),
    account_status ENUM('PENDING', 'ACTIVE', 'DISABLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email_role (email, role)
);

-- Exit MySQL
EXIT;
```

### 5. Environment Configuration

#### Backend Configuration

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=code_explainer
JWT_SECRET=your_jwt_secret_key_change_in_production

# Optional: Email configuration for OTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

**For Gmail OTP emails:**

1. Enable 2-Factor Authentication in your Gmail account
2. Generate an App Password: <https://myaccount.google.com/apppasswords>
3. Use the 16-character app password as `EMAIL_PASS`

### 6. Start the Application

#### Start Backend Server

```bash
cd backend
npm start
```

Backend will run on `http://localhost:5000`

#### Start Frontend (in a new terminal)

```bash
# From project root
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Usage

### First Time Setup

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create a new account
3. Choose your role (User or Admin)
4. Complete registration
5. **For Admin accounts:** Wait for admin approval (or manually approve in database)

### Demo Accounts

After setting up the database, you can create these demo accounts:

**User Account:**

- Email: `user@demo.com`
- Password: `password123`

**Admin Account:**

- Email: `admin@demo.com`
- Password: `password123`

### Features Overview

#### For Users

- Login with email/password or OTP
- Access AI code explanation tool
- View personal dashboard
- Update profile information

#### For Admins

- All user features plus:
- Admin dashboard with user management
- Approve/deny admin registration requests
- Disable/enable user accounts
- View system statistics

## 📡 API Endpoints

### Authentication

```
POST /auth/register          - Register new user
POST /auth/login            - Login with password
POST /auth/request-otp      - Request OTP via email
POST /auth/verify-otp       - Verify OTP and login
```

### Admin Management (Admin only)

```
GET  /admin/users           - List all users
GET  /admin/pending-admins  - List pending admin approvals
GET  /admin/all-admins      - List all admins
POST /admin/approve-admin/:id - Approve admin request
POST /admin/deny-admin/:id    - Deny admin request
POST /admin/disable-user/:id  - Disable user account
POST /admin/enable-user/:id   - Enable user account
POST /admin/disable-admin/:id - Disable admin account
```

### Headers Required

For protected endpoints, include:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 🏗️ Project Structure

```
mini-project/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── index.js           # Express server setup
│   │   ├── authRoutes.js      # Authentication endpoints
│   │   ├── adminRoutes.js     # Admin management endpoints
│   │   ├── db.js              # Database connection
│   │   ├── email.js           # Email service (OTP)
│   │   └── ...
│   ├── sql/
│   │   └── schema.sql         # Database schema
│   ├── .env                   # Environment variables
│   └── package.json
├── src/                        # Frontend application
│   ├── components/             # React components
│   ├── App.jsx                 # Main app component
│   ├── AuthContext.jsx         # Authentication context
│   ├── api.js                  # API client
│   └── ...
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

#### Backend

```bash
cd backend
npm start         # Start production server
npm run dev       # Start with nodemon (auto-reload)
```

### Code Quality

- **ESLint** is configured for code linting
- Follow React best practices
- Use meaningful commit messages

## 🚀 Deployment

### Frontend Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service (Netlify, Vercel, etc.)

### Backend Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/index.js --name "code-explainer-backend"
```

### Database

- Use a cloud MySQL service (AWS RDS, PlanetScale, etc.)
- Update `.env` with production database credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Cannot connect to MySQL"**

- Ensure MySQL service is running
- Check database credentials in `backend/.env`
- Verify database exists: `CREATE DATABASE code_explainer;`

**"Port 5000 already in use"**

- Change port in `backend/.env`: `PORT=5001`
- Or kill process using port 5000

**"Email not sending"**

- Check email credentials in `backend/.env`
- For Gmail, ensure App Password is used (not regular password)
- Verify 2FA is enabled on Gmail account

**"CORS errors"**

- Backend is configured for CORS, ensure frontend is accessing correct URL
- Default: `http://localhost:5000`

**"Build fails"**

- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall if needed

## 📞 Support

For support, please:

1. Check this README
2. Review existing issues on GitHub
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- MySQL for reliable database
- All contributors and users

---

**Made with ❤️ by CodeExplainer Team**

*Transforming code understanding through AI-powered explanations*</content>
<parameter name="filePath">c:\Users\Ashutosh Mishra\OneDrive\Desktop\New folder\README.md
