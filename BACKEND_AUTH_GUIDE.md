# Backend API Authentication Integration Guide

## 🎉 Overview

Your application now supports **dual authentication methods**:

1. **Password Login** (Backend API) - NEW! ✨
2. **OTP Login** (Supabase) - Existing
3. **Google OAuth** (Supabase) - Existing

The authentication system intelligently prioritizes backend API tokens while maintaining backward compatibility with Supabase authentication.

---

## 🚀 What's New

### New Files Created

1. **`src/services/authService.ts`** - Backend API authentication service
   - Password-based login
   - OTP-based login
   - Token management
   - Session handling

2. **Updated `src/services/apiClient.ts`** - Enhanced API client
   - Dual token support (Backend + Supabase)
   - Automatic token prioritization
   - Improved type safety

3. **Updated `src/pages/Auth.tsx`** - Enhanced login page
   - Tabbed interface for Password/OTP selection
   - Seamless integration with backend API
   - Beautiful UI with responsive design

---

## 📋 Features

### Authentication Service Features

✅ **Password Authentication**
- Email + Password login
- Secure token storage
- Automatic token refresh
- Session expiration handling

✅ **OTP Authentication** (Backend API)
- Request OTP via email
- Verify OTP code
- Secure one-time password flow

✅ **Token Management**
- Access token storage
- Refresh token handling
- Automatic token expiration check
- Secure localStorage management

✅ **Session Management**
- Check authentication status
- Get current user info
- Validate tokens
- Automatic logout on expiration

---

## 🔐 How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Opens Login Page                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           Choose Authentication Method (Tabs)                │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Password   │  │     OTP      │  │    Google    │      │
│  │    Login     │  │    Login     │  │    OAuth     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────────┐
│Password│  │  OTP   │  │   Google   │
│  Flow  │  │  Flow  │  │    Flow    │
└────┬───┘  └────┬───┘  └──────┬─────┘
     │           │              │
     └───────────┼──────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │   Backend API Login  │
      │  or Supabase Login   │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │   Store Auth Token   │
      │   & User Info        │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │  Redirect to         │
      │  Dashboard           │
      └──────────────────────┘
```

### Token Priority

The API client checks for authentication tokens in this order:

1. **Backend API Token** (Priority 1) - Stored in `localStorage['backend_auth_token']`
2. **Supabase Token** (Fallback) - Retrieved from Supabase session

This ensures that if a user logs in via the backend API, their backend token is used for all API calls.

---

## 💻 Usage Examples

### 1. Password Login (Backend API)

```typescript
import { AuthService } from '@/services/authService';

const handleLogin = async () => {
  const response = await AuthService.loginWithPassword(
    'user@example.com',
    'SecurePassword123!'
  );

  if (response.success && response.data) {
    console.log('Logged in successfully!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token);
    // Token is automatically stored
  } else {
    console.error('Login failed:', response.error);
  }
};
```

### 2. OTP Login (Backend API)

```typescript
import { AuthService } from '@/services/authService';

// Step 1: Request OTP
const requestOTP = async () => {
  const response = await AuthService.requestOTP('user@example.com');
  
  if (response.success) {
    console.log('OTP sent to email!');
  }
};

// Step 2: Verify OTP
const verifyOTP = async (otp: string) => {
  const response = await AuthService.loginWithOTP(
    'user@example.com',
    otp
  );

  if (response.success) {
    console.log('Logged in with OTP!');
  }
};
```

### 3. Check Authentication Status

```typescript
import { AuthService } from '@/services/authService';

// Check if user is authenticated
const isLoggedIn = AuthService.isAuthenticated();

if (isLoggedIn) {
  const user = AuthService.getCurrentUser();
  const token = AuthService.getAccessToken();
  
  console.log('User is logged in:', user);
  console.log('Access token:', token);
}
```

### 4. Logout

```typescript
import { AuthService } from '@/services/authService';

const handleLogout = async () => {
  await AuthService.logout();
  console.log('User logged out successfully');
  // Tokens are automatically cleared
};
```

### 5. Refresh Token

```typescript
import { AuthService } from '@/services/authService';

const refreshUserToken = async () => {
  const response = await AuthService.refreshToken();
  
  if (response.success) {
    console.log('Token refreshed successfully');
  } else {
    console.error('Token refresh failed, please login again');
  }
};
```

---

## 🎨 UI/UX Updates

### Login Page Enhancements

The Auth page now features:

1. **Tabbed Interface**
   - Password tab (Backend API)
   - OTP tab (Supabase/Backend API)
   - Easy switching between methods

2. **Password Login Form**
   - Email input with icon
   - Password input with icon
   - "Sign In" button
   - Loading states
   - Error handling

3. **OTP Login Form**
   - Email input
   - "Send OTP" button
   - 6-digit OTP verification
   - Resend functionality

4. **Google OAuth**
   - Still available below both tabs
   - Single sign-on option

---

## 🔧 Configuration

### Backend API Endpoints

The authentication service uses these endpoints (defined in `src/config/api.ts`):

```typescript
AUTH: {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  VALIDATE: '/auth/validate',
}
```

### Environment Variables

Make sure your `.env.local` file includes:

```bash
VITE_BACKEND_API_URL=https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com
VITE_API_TIMEOUT=30000
```

---

## 📊 API Request/Response Format

### Login Request (Password)

```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "loginType": "password"
}
```

### Login Request (OTP)

```json
POST /auth/login
{
  "email": "user@example.com",
  "otp": "123456",
  "loginType": "otp"
}
```

### Login Response

```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## 🛡️ Security Features

✅ **Secure Token Storage** - Tokens stored in localStorage with expiration
✅ **Automatic Token Refresh** - Refresh tokens before expiration
✅ **Token Validation** - Validate tokens on protected routes
✅ **Dual Authentication** - Support for multiple auth methods
✅ **Error Handling** - Comprehensive error messages
✅ **Rate Limiting** - Built-in rate limiting for OTP requests

---

## 🧪 Testing

### Test the Password Login

1. Open your app: http://localhost:8080/auth
2. Click the **Password** tab
3. Enter email and password
4. Click "Sign In"
5. Check browser console for token
6. Verify redirect to dashboard

### Test the OTP Login

1. Open your app: http://localhost:8080/auth
2. Click the **OTP** tab
3. Enter email
4. Click "Send OTP"
5. Check email for OTP
6. Enter 6-digit code
7. Verify automatic login

### Test Token Persistence

```javascript
// In browser console
const token = localStorage.getItem('backend_auth_token');
console.log('Stored token:', token);

const user = localStorage.getItem('backend_user');
console.log('Stored user:', JSON.parse(user));
```

---

## 🐛 Troubleshooting

### Issue: Login fails with "Network Error"

**Solution:**
- Ensure backend API is running
- Check `VITE_BACKEND_API_URL` in `.env.local`
- Verify CORS is configured on backend

### Issue: Token not being sent with requests

**Solution:**
- Check localStorage for `backend_auth_token`
- Verify apiClient is using the token
- Check Network tab for Authorization header

### Issue: User gets logged out immediately

**Solution:**
- Check token expiration time
- Implement automatic token refresh
- Verify token validation on backend

---

## 📚 Additional Resources

- **Backend API Docs**: `BACKEND_API_INTEGRATION.md`
- **Quick Start Guide**: `QUICK_START_BACKEND_API.md`
- **API Client Docs**: `src/services/apiClient.ts`
- **Auth Service Docs**: `src/services/authService.ts`

---

## 🎯 Next Steps

1. ✅ **Test the new login flow**
2. ✅ **Configure your backend endpoints**
3. ✅ **Update user roles/permissions**
4. ✅ **Implement forgot password flow**
5. ✅ **Add remember me functionality**
6. ✅ **Set up token refresh automation**

---

## 🤝 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify backend API is accessible
3. Check Network tab for failed requests
4. Review authentication token in localStorage
5. Test with different authentication methods

---

**Happy Coding! 🚀**

Your authentication system is now powered by both backend API and Supabase, giving you flexibility and robust security!

