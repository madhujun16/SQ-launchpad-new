# Backend API Requirements

## ✅ APIs Already Available

Based on the OpenAPI spec at `http://localhost:8080/api/openapi.json`, these endpoints exist:

- ✅ `/api/send/otp` - Send OTP
- ✅ `/api/verify/otp` - Verify OTP and login
- ✅ `/api/user/all` - Get all users
- ✅ `/api/user` - Create user
- ✅ `/api/organization` - Organization CRUD (GET/POST/PUT/DELETE)
- ✅ `/api/site/all` - Get all sites
- ✅ `/api/site` - Site CRUD
- ✅ `/api/page` - Page management
- ✅ `/api/section` - Section management
- ✅ `/api/generate-upload-url` - File upload signed URLs

## ❓ APIs That May Be Missing

### 1. User Management
**Current Status**: Frontend expects these endpoints:
- ✅ `/api/user/all` - EXISTS
- ✅ `/api/user` (POST) - EXISTS
- ❓ `/api/user/{id}` (GET) - **Might be missing** - Need to get single user by ID
- ❓ `/api/user/{id}` (PUT) - **Might be missing** - Need to update user
- ❓ `/api/user/{id}` (DELETE) - **Might be missing** - Need to delete user

**Recommendation**: Add these endpoints if they don't exist:
```python
GET /api/user/{user_id}  # Get user by ID
PUT /api/user/{user_id}  # Update user
DELETE /api/user/{user_id}  # Delete user
```

### 2. User Info After Login
**Current Status**: After OTP verification, frontend needs user details (role, name, etc.)

**Current Behavior**: Backend only returns `{ message: "Login successful" }` and sets cookie.

**Recommendation**: Either:
- Option A: Return user data in `/api/verify/otp` response:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "role_id": 1
    }
  }
  ```
- Option B: Add a new endpoint `/api/user/me` to get current user info:
  ```python
  GET /api/user/me  # Get current logged-in user info
  ```

### 3. Logout Endpoint
**Current Status**: Frontend expects `/api/logout` but it's not in the OpenAPI spec.

**Recommendation**: Add logout endpoint:
```python
POST /api/logout  # Clear session cookie and logout user
```

### 4. Site Management
**Current Status**: 
- ✅ `/api/site/all` - EXISTS
- ✅ `/api/site` (POST) - EXISTS
- ❓ `/api/site` (PUT) - **Need to verify** - Update site
- ❓ `/api/site?site_id={id}` (DELETE) - **Need to verify** - Delete site

**Recommendation**: Verify these endpoints exist and work correctly.

### 5. Dashboard Data
**Current Status**: Frontend has dashboard components that may need aggregated data.

**Recommendation**: Add dashboard endpoints if needed:
```python
GET /api/dashboard/stats  # Get dashboard statistics
GET /api/dashboard/sites  # Get sites summary
GET /api/dashboard/approvals  # Get pending approvals
```

## 🔧 Implementation Priority

### High Priority (Required for basic functionality)
1. **User Info After Login** - Frontend needs user data to set role/permissions
2. **Logout Endpoint** - For proper session management
3. **User Update/Delete** - If user management page needs these features

### Medium Priority (Nice to have)
4. **Get Single User** - For user detail pages
5. **Dashboard Endpoints** - If dashboard needs aggregated data

### Low Priority (Future enhancements)
6. **Additional filtering/search endpoints**
7. **Bulk operations**

## 📝 Notes

- All endpoints should return consistent error format: `{ message: "error message" }`
- All GET endpoints should return: `{ message: "...", data: [...] }` or `{ message: "...", data: {...} }`
- All endpoints should support cookie-based authentication (`session_id` cookie)
- CORS must be enabled with `supports_credentials=True` for cookie handling

## 🧪 Testing

After adding new endpoints:
1. Test in Swagger UI: `http://localhost:8080/api/ui/`
2. Verify cookie is sent with requests
3. Test error handling
4. Verify response format matches frontend expectations

