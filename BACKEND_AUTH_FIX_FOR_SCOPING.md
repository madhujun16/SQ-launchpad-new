# Backend Authentication Fix for Scoping Submission

## 🔴 Problem

The `/api/site/{site_id}/scoping/submit` endpoint is returning **401 Unauthorized** because it's using a placeholder authentication mechanism instead of reading the session cookie.

## ✅ Solution

The backend needs to read the `session_id` cookie (same as `/api/user/me` endpoint) instead of using a placeholder `X-User-Id` header.

---

## 🔍 Step 1: Check Current Backend Implementation

First, check if your backend is already using cookie-based authentication. Look for the scoping submission endpoint in your backend code:

**File to check:** Your Flask/Connexion controller that handles `/api/site/{site_id}/scoping/submit`

**What to look for:**
- ❌ If you see `X-User-Id` header being read → **Needs fix**
- ✅ If you see `request.cookies.get('session_id')` → **Already fixed**

---

## 🛠️ Step 2: Backend Code Changes Required

### Option A: If Using Flask Directly

Replace the placeholder authentication with this:

```python
from flask import request
from your_auth_module import decode_jwt_token, get_user_by_id

def get_current_user():
    """Get current user from session cookie (same as /api/user/me endpoint)."""
    session_id = request.cookies.get('session_id')
    if not session_id:
        return None
    
    try:
        # Decode JWT token from cookie
        user_data = decode_jwt_token(session_id)
        user_id = user_data.get('user_id')
        
        if not user_id:
            return None
        
        # Get user from database
        user = get_user_by_id(user_id)
        return user
    except Exception as e:
        print(f"Error decoding session token: {e}")
        return None

# In your scoping submission endpoint:
@route('/api/site/<site_id>/scoping/submit', methods=['POST'])
def submit_scoping(site_id):
    # Get current user from session cookie
    current_user = get_current_user()
    
    if not current_user:
        return {"message": "Authentication required"}, 401
    
    # Check if user has Deployment Engineer role
    if not has_role(current_user, 'deployment_engineer'):
        return {"message": "Permission denied. Deployment Engineer role required."}, 403
    
    # Use current_user.id for deployment_engineer_id
    deployment_engineer_id = current_user.id
    deployment_engineer_name = current_user.full_name or current_user.email
    
    # ... rest of your submission logic ...
```

### Option B: If Using Connexion/OpenAPI

Update your OpenAPI spec and controller:

**OpenAPI Spec (`openapi.yaml`):**
```yaml
paths:
  /site/{site_id}/scoping/submit:
    post:
      security:
        - cookieAuth: []
      parameters:
        - name: site_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ScopingSubmission'
      responses:
        '200':
          description: Success
        '401':
          description: Unauthorized
        '403':
          description: Forbidden

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: session_id
```

**Controller Implementation:**
```python
def submit_scoping(site_id: str, body: dict):
    """Submit scoping for approval."""
    from flask import request
    from your_auth_module import decode_jwt_token, get_user_by_id
    
    # Get session cookie
    session_id = request.cookies.get('session_id')
    if not session_id:
        return {"message": "Authentication required"}, 401
    
    try:
        # Decode JWT
        user_data = decode_jwt_token(session_id)
        user_id = user_data.get('user_id')
        user = get_user_by_id(user_id)
        
        if not user:
            return {"message": "Invalid session"}, 401
        
        # Check role
        if not has_role(user, 'deployment_engineer'):
            return {"message": "Permission denied"}, 403
        
        # Proceed with submission
        # ... your existing logic ...
        
    except Exception as e:
        return {"message": f"Authentication error: {str(e)}"}, 401
```

---

## 🔄 Step 3: Use Same Auth Function as `/api/user/me`

**Important:** Use the **exact same authentication function** that your `/api/user/me` endpoint uses. This ensures consistency.

**Example:**
```python
# If /api/user/me uses this:
def get_current_user_from_session():
    session_id = request.cookies.get('session_id')
    # ... decode and return user ...

# Then scoping endpoint should use the SAME function:
def submit_scoping(site_id):
    user = get_current_user_from_session()  # Same function!
    if not user:
        return {"message": "Authentication required"}, 401
    # ... rest of code ...
```

---

## 🧪 Step 4: Test the Fix

### Test 1: Check Authentication
```bash
# 1. Login first to get session cookie
curl -X POST https://your-backend.com/api/verify/otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "token": "123456"}' \
  -c cookies.txt

# 2. Try submitting scoping (should work now)
curl -X POST https://your-backend.com/api/site/{site_id}/scoping/submit \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "site_name": "Test Site",
    "selected_software": [...],
    "selected_hardware": [...],
    "cost_summary": {...}
  }'
```

### Test 2: Without Cookie (Should Return 401)
```bash
# Should return 401
curl -X POST https://your-backend.com/api/site/{site_id}/scoping/submit \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📋 Checklist

- [ ] Find the scoping submission endpoint in backend code
- [ ] Replace `X-User-Id` header reading with `session_id` cookie reading
- [ ] Use the same auth function as `/api/user/me`
- [ ] Test with valid session cookie → Should return 200
- [ ] Test without session cookie → Should return 401
- [ ] Test with expired session → Should return 401
- [ ] Deploy backend changes
- [ ] Test from frontend → Should work now!

---

## 🚨 Common Issues

### Issue 1: CORS Not Allowing Cookies
**Symptom:** Cookies not being sent from frontend

**Fix:** Ensure backend CORS allows credentials:
```python
from flask_cors import CORS

CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'https://your-frontend.com'])
```

### Issue 2: Cookie Domain Mismatch
**Symptom:** Cookie set but not sent with requests

**Fix:** Ensure cookie domain matches your frontend domain:
```python
response.set_cookie(
    'session_id',
    value=token,
    httponly=True,
    samesite='Lax',
    secure=True,  # Use True in production with HTTPS
    max_age=3600
)
```

### Issue 3: JWT Decode Error
**Symptom:** 401 even with valid cookie

**Fix:** Check JWT secret key matches between login and scoping endpoints:
```python
# Use same secret key for encoding and decoding
JWT_SECRET = os.getenv('JWT_SECRET')
```

---

## 📝 Quick Reference

**What Frontend Sends:**
- Cookie: `session_id=<jwt_token>` (automatically via `credentials: 'include'`)
- No `Authorization` header needed
- No `X-User-Id` header needed

**What Backend Should Do:**
1. Read `request.cookies.get('session_id')`
2. Decode JWT token
3. Get user from database
4. Check user role
5. Proceed with request

**Error Responses:**
- `401 Unauthorized`: No cookie or invalid/expired token
- `403 Forbidden`: Valid user but wrong role
- `200 OK`: Success with approval data

---

## 🎯 After Backend Fix

Once the backend is fixed:
1. ✅ Frontend will automatically work (no changes needed)
2. ✅ Users can submit scoping for approval
3. ✅ Session expiration will be handled gracefully
4. ✅ Error messages will guide users to re-login

---

## 📞 Need Help?

If you're unsure about:
- Where the backend code is located
- How to decode JWT tokens in your backend
- How to check user roles

Check your existing `/api/user/me` endpoint implementation - it should already have the correct authentication pattern that you can copy!

