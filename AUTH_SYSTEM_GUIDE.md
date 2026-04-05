# CodeLens Authentication System - Implementation Guide

## Overview

Your CodeLens application now has a complete authentication and authorization system with a three-step signup process and login functionality.

## How It Works

### 1. **Authentication Flow**

#### First Time Users (Sign Up)

1. **Step 1 - Personal Details**
   - First Name (required)
   - Middle Name (optional)
   - Last Name (required)
   - Email (required)
   - Create Password (minimum 6 characters, required)
   - Confirm Password (required)

2. **Step 2 - OTP Verification**
   - OTP is generated and displayed in the console
   - User enters the 6-digit OTP
   - For demo purposes,  OTP is shown on the screen

3. **Step 3 - Account Type Selection**
   - **Free Plan**: ₹0 - Basic access with limited explanations
   - **Pro Plan**: ₹12/month - Unlimited explanations and advanced features

4. **Profile Auto-Completion**
   - After account type selection, user is redirected to sign-in
   - All user data is stored in localStorage
   - User profile displays name, email, and account type

#### Existing Users (Sign In)

- Enter email and password
- Click "Sign In"
- Redirected to the Code Explainer if credentials are valid

### 2. **Access Control**

- Users MUST login before accessing the Code Explainer application
- If user tries to access `/app` without logging in, they see a "Please login first" message
- The system shows their current plan (Free or Pro) in the navigation bar

### 3. **User Data Storage**

- Currently using localStorage for storing user data
- For production, replace with a backend API/database
- User data includes:
  - User ID
  - First, Middle, Last name
  - Email
  - Password (hash it in production!)
  - Account type (free/pro)
  - Account price
  - Creation timestamp

## File Structure

```
src/
├── App.jsx                 # Main app with routing & auth protection
├── App.css                 # Original styling (unchanged)
├── AuthContext.jsx         # Auth state management
├── Auth.css                # Authentication UI styling
├── SignIn.jsx             # Sign-in component
├── SignUp.jsx             # Sign-up component (3-step process)
├── CodeExplainer.jsx      # Original code explainer (protected route)
└── main.jsx               # Entry point
```

## Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Everyone | Redirects to `/app` |
| `/signin` | Public | Login page |
| `/signup` | Public | Registration page (3 steps) |
| `/app` | Protected | Code Explainer (requires login) |
| `*` | Everyone | Catch-all, redirects to `/app` |

## Components Overview

### AuthContext.jsx

- Manages authentication state globally
- Methods:
  - `signUp(userData)` - Register new user
  - `signIn(email, password)` - Login user
  - `signOut()` - Logout user
  - `updateUserProfile(updates)` - Update user info

### SignIn.jsx

- Email and password input
- Error handling for invalid credentials
- Link to signup page

### SignUp.jsx

- 3-step registration process:
  1. Collect user details
  2. Verify OTP
  3. Choose account plan
- Form validation
- Auto-profile completion after plan selection

### CodeExplainer.jsx

- Original app functionality (unchanged)
- Added:
  - User name and plan display in navbar
  - Logout button
  - Protected by ProtectedRoute component

## Styling

### Auth.css Features

- Gradient purple background (matching your theme)
- Responsive design (mobile, tablet, desktop)
- Form validation styling
- Account type cards with hover effects
- Smooth animations
- Professional UI with consistent colors

## Demo Usage

1. **First time visit**: Will see "Please login first" message
2. **Click "Create Account"**: Go through 3-step signup
   - OTP will be shown in browser console and on screen
   - Select Free or Pro plan
3. **After signup**: Automatically redirected to login
4. **Login**: Use credentials just created
5. **Access app**: Now able to use Code Explainer
6. **Logout**: Button in top-right navbar

## Important Notes for Production

1. **Password Security**
   - Currently passwords are stored as plain text in localStorage
   - Use bcrypt to hash passwords
   - Implement JWT tokens for authentication

2. **Backend Integration**
   - Replace localStorage with API calls
   - Create endpoints:
     - POST `/auth/signup`
     - POST `/auth/signin`
     - POST `/auth/signout`
     - GET `/auth/verify-otp`

3. **OTP Implementation**
   - Replace console OTP with email/SMS sending
   - Implement OTP expiration (usually 5-10 minutes)
   - Rate limit OTP generation

4. **Data Validation**
   - Add server-side validation
   - Sanitize email inputs
   - Enforce password policies

5. **Session Management**
   - Implement refresh tokens
   - Add session timeout
   - Handle token expiration

## Testing the System

### Test Case 1: New User

1. Go to <http://localhost:5173>
2. Click "Create Account"
3. Fill form with any email/password
4. Code will show 6-digit OTP (also in console)
5. Enter OTP
6. Select account plan
7. Login with same credentials

### Test Case 2: Protected Route Access

1. Logout
2. Try to access <http://localhost:5173/app> directly
3. Should see "Please login first" message

### Test Case 3: Invalid Credentials

1. Try to login with wrong password
2. Should see error message

## Customization Options

- **Colors**: Edit Auth.css and App.css to change gradient colors
- **OTP Length**: In SignUp.jsx, change `.slice(0, 6)` for different length
- **Account Plans**: Add/modify plans in SignUp.jsx `handleAccountTypeSelect`
- **Form Fields**: Add more fields in SignUp first step
- **Validation**: Add custom validation in SignIn/SignUp components

## Next Steps

1. Test the authentication system thoroughly
2. Integrate with backend API
3. Add forgot password functionality
4. Implement email verification
5. Add user profile/settings page
6. Implement payment for Pro plan
7. Add user dashboard with history

---

**Your authentication system is now live! Users can signup, login, and access the Code Explainer after authentication.**
