# Hybrid Authentication Guide

## Overview

The backend now supports **hybrid authentication** - it can use both session cookies (primary) and `X-User-Id` header (fallback) for authentication. This allows the system to work in both production and development modes.

## How It Works

### Backend Authentication Flow

The backend's `get_current_user()` function tries authentication methods in this order:

1. **Session Cookie (Primary)** - When authentication is enabled
   - Reads `session_id` cookie
   - Decrypts JWT token
   - Gets user by email
   - ✅ **Production mode**

2. **X-User-Id Header (Fallback)** - For development when auth is disabled
   - Reads `X-User-Id` header
   - Gets user by ID directly
   - ✅ **Development mode**

3. **Neither exists** → Returns `None` (401 Unauthorized)

### Frontend Implementation

The frontend automatically supports both methods:

#### Primary: Session Cookie
- **Always enabled** via `credentials: 'include'`
- Cookies are sent automatically with all requests
- Works when user is logged in normally

#### Fallback: X-User-Id Header
- **Optionally enabled** for development
- Added automatically when:
  - `VITE_BYPASS_AUTH=true` (bypass auth mode), OR
  - `VITE_USE_DEV_AUTH_HEADER=true` (explicit dev header mode)
- Gets user ID from localStorage (`auth_user`)
- Backend falls back to this if no cookie exists

## Configuration

### Environment Variables

```bash
# Option 1: Bypass auth (automatically uses X-User-Id header)
VITE_BYPASS_AUTH=true

# Option 2: Explicitly enable dev header (still uses cookies if available)
VITE_USE_DEV_AUTH_HEADER=true

# Option 3: Normal authentication (uses cookies only)
VITE_BYPASS_AUTH=false
VITE_USE_DEV_AUTH_HEADER=false  # or omit
```

### Frontend Code

The `apiClient` automatically handles both methods:

```typescript
// apiClient.ts automatically:
// 1. Always sends cookies (credentials: 'include')
// 2. Optionally adds X-User-Id header if:
//    - VITE_BYPASS_AUTH=true, OR
//    - VITE_USE_DEV_AUTH_HEADER=true
```

## Use Cases

### Production Mode
```bash
VITE_BYPASS_AUTH=false
```
- ✅ Uses session cookies
- ✅ Secure authentication
- ✅ Session expires after 1 hour
- ✅ Automatic redirect to login on 401

### Development Mode (Bypass Auth)
```bash
VITE_BYPASS_AUTH=true
```
- ✅ Uses X-User-Id header
- ✅ No login required
- ✅ Faster development
- ⚠️ Not secure (dev only)

### Development Mode (With Auth Header Fallback)
```bash
VITE_BYPASS_AUTH=false
VITE_USE_DEV_AUTH_HEADER=true
```
- ✅ Tries cookies first (if logged in)
- ✅ Falls back to X-User-Id header (if no cookie)
- ✅ Works in both scenarios
- ✅ Good for testing auth flows

## Request Flow

### Scenario 1: User is Logged In (Production)
```
Frontend Request:
  - credentials: 'include' ✅
  - Cookie: session_id=xxx ✅
  - X-User-Id: (not added)

Backend:
  - Reads session_id cookie ✅
  - Decrypts JWT ✅
  - Gets user ✅
  - Returns 200 OK ✅
```

### Scenario 2: Development (Bypass Auth)
```
Frontend Request:
  - credentials: 'include' ✅
  - Cookie: (none)
  - X-User-Id: 123 ✅ (added automatically)

Backend:
  - Tries session_id cookie (none) ❌
  - Falls back to X-User-Id header ✅
  - Gets user by ID ✅
  - Returns 200 OK ✅
```

### Scenario 3: No Authentication
```
Frontend Request:
  - credentials: 'include' ✅
  - Cookie: (none)
  - X-User-Id: (none)

Backend:
  - Tries session_id cookie (none) ❌
  - Tries X-User-Id header (none) ❌
  - Returns 401 Unauthorized ❌
```

## Testing

### Test Cookie Authentication
```bash
# 1. Login normally
curl -X POST /api/verify/otp -d '{"email":"user@example.com","token":"123456"}' -c cookies.txt

# 2. Submit scoping (uses cookie)
curl -X POST /api/site/123/scoping/submit \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Test Header Authentication
```bash
# Submit scoping (uses header)
curl -X POST /api/site/123/scoping/submit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{...}'
```

## Benefits

1. **Flexibility** - Works in both production and development
2. **Backward Compatible** - Existing cookie-based auth still works
3. **Development Friendly** - Easy to test without full auth flow
4. **Automatic Fallback** - Backend handles both methods seamlessly
5. **No Code Changes Needed** - Frontend automatically adapts

## Security Notes

⚠️ **Important:**
- `X-User-Id` header is **only for development**
- Never use in production
- Backend should validate user permissions even with header
- Cookie-based auth is more secure (HTTP-only, encrypted)

## Troubleshooting

### Issue: Still getting 401
**Check:**
1. Is `VITE_BYPASS_AUTH=true`? (for dev mode)
2. Is user ID in localStorage? (check `auth_user` key)
3. Is backend reading the header? (check backend logs)

### Issue: Cookie not working
**Check:**
1. Is `credentials: 'include'` set? ✅ (already set)
2. Is CORS configured correctly? (backend)
3. Is cookie domain correct? (backend)

### Issue: Header not working
**Check:**
1. Is `VITE_BYPASS_AUTH=true` or `VITE_USE_DEV_AUTH_HEADER=true`?
2. Is user logged in? (check localStorage)
3. Is backend configured to read header? (backend)

## Summary

✅ **Frontend automatically supports both methods**
✅ **Backend falls back gracefully**
✅ **No code changes needed for most cases**
✅ **Works in production (cookies) and development (header)**

The hybrid approach ensures the system works in all scenarios while maintaining security in production.

