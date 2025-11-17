# Backend API Endpoints Reference

## Base URL
```
https://sqlaunchpad.com
```

---

## Authentication Endpoints

### 1. **Send OTP** (Request OTP)

**Endpoint:** `POST /auth/send-otp`

**Purpose:** Send a one-time password to user's email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "success": true
}
```

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.requestOTP('user@example.com');
```

---

### 2. **Verify OTP** (Login with OTP)

**Endpoint:** `POST /api/verify/otp`

**Purpose:** Verify OTP and log in user

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "roles": ["admin", "ops_manager"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.loginWithOTP(
  'user@example.com',
  '123456'
);

if (response.success) {
  console.log('User logged in:', response.data?.user);
}
```

---

### 3. **Password Login**

**Endpoint:** `POST /auth/login`

**Purpose:** Login with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "loginType": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "roles": ["admin", "ops_manager"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.loginWithPassword(
  'user@example.com',
  'password123'
);

if (response.success) {
  console.log('User logged in:', response.data?.user);
}
```

---

### 4. **Logout**

**Endpoint:** `POST /auth/logout`

**Purpose:** Logout current user

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

await AuthService.logout();
// Tokens are automatically cleared from localStorage
```

---

### 5. **Refresh Token**

**Endpoint:** `POST /auth/refresh`

**Purpose:** Refresh expired access token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
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

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.refreshToken();

if (response.success) {
  console.log('Token refreshed');
}
```

---

### 6. **Validate Token**

**Endpoint:** `GET /auth/validate`

**Purpose:** Check if current token is valid

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

**Usage in Code:**
```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.validateToken();

if (response.success && response.data?.valid) {
  console.log('Token is valid');
} else {
  console.log('Token is invalid or expired');
}
```

---

## Complete Authentication Flow

### OTP Login Flow

```typescript
import { AuthService } from '@/services/authService';

// Step 1: Request OTP
const otpResponse = await AuthService.requestOTP('user@example.com');

if (otpResponse.success) {
  console.log('✅ OTP sent to email');
  
  // Step 2: User receives OTP via email (e.g., "123456")
  
  // Step 3: Verify OTP and login
  const loginResponse = await AuthService.loginWithOTP(
    'user@example.com',
    '123456'
  );
  
  if (loginResponse.success) {
    console.log('✅ User logged in successfully');
    console.log('User:', loginResponse.data?.user);
    console.log('Token:', loginResponse.data?.token);
    // Token is automatically stored in localStorage
  } else {
    console.error('❌ Login failed:', loginResponse.error);
  }
} else {
  console.error('❌ Failed to send OTP:', otpResponse.error);
}
```

### Password Login Flow

```typescript
import { AuthService } from '@/services/authService';

const response = await AuthService.loginWithPassword(
  'user@example.com',
  'SecurePassword123!'
);

if (response.success) {
  console.log('✅ User logged in successfully');
  console.log('User:', response.data?.user);
  // Token is automatically stored in localStorage
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
} else {
  console.error('❌ Login failed:', response.error?.message);
}
```

---

## Token Storage

Tokens are automatically stored in `localStorage`:

```typescript
// Access token
localStorage.getItem('backend_auth_token')

// Refresh token
localStorage.getItem('backend_refresh_token')

// User data
localStorage.getItem('backend_user')

// Token expiration
localStorage.getItem('backend_token_expires_at')
```

---

## Error Handling

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: any;
  };
}
```

**Example Error Handling:**

```typescript
const response = await AuthService.loginWithPassword(email, password);

if (!response.success) {
  // Handle different error types
  switch (response.error?.statusCode) {
    case 401:
      console.error('Invalid credentials');
      break;
    case 429:
      console.error('Too many attempts, please wait');
      break;
    case 500:
      console.error('Server error, please try again later');
      break;
    default:
      console.error(response.error?.message || 'An error occurred');
  }
} else {
  console.log('Success!', response.data);
}
```

---

## Testing API Endpoints

### Test in Browser Console

```javascript
// Test health endpoint
const response = await fetch('https://sqlaunchpad.com/health');
console.log(await response.json());

// Test send OTP
const otpResponse = await fetch('https://sqlaunchpad.com/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
});
console.log(await otpResponse.json());
```

### Test with API Client

```typescript
import { apiClient } from '@/services/apiClient';

// Test health
const health = await apiClient.get('/health');
console.log('Health:', health);

// Test send OTP
const otp = await apiClient.post('/auth/send-otp', { 
  email: 'test@example.com' 
});
console.log('OTP:', otp);
```

---

## Rate Limiting

The frontend implements rate limiting for OTP requests:

- **Minimum interval between requests:** 30 seconds
- **Displays countdown timer** when rate limited
- **Shows user-friendly messages**

---

## Security

### Token Expiration
- Access tokens expire after `expiresIn` seconds (typically 3600s = 1 hour)
- Refresh tokens are used to get new access tokens
- Expired tokens trigger automatic logout

### Token Validation
- Tokens are validated on protected routes
- Invalid tokens trigger automatic logout
- Token validation happens automatically

### Headers
All authenticated requests include:
```
Authorization: Bearer <access_token>
```

---

## Environment Configuration

Set these in `.env.local`:

```bash
VITE_BACKEND_API_URL=https://sqlaunchpad.com
VITE_API_TIMEOUT=30000
```

---

## Summary of Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/send-otp` | Send OTP to email |
| POST | `/api/verify/otp` | Verify OTP and login |
| POST | `/auth/login` | Login with password |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/validate` | Validate token |
| GET | `/health` | Health check |

---

**Last Updated:** November 17, 2025  
**API Base URL:** https://sqlaunchpad.com

