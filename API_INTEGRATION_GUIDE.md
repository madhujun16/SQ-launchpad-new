# API Integration Guide - Flask Backend

This document describes how the React frontend integrates with the Flask backend API.

## Backend Architecture

- **Framework**: Flask with Connexion (OpenAPI/Swagger)
- **Database**: MySQL (Cloud SQL) with SSL
- **Authentication**: JWT tokens stored in HTTP-only cookies (`session_id`)
- **Deployment**: Google Cloud Platform (App Engine)
- **API Base URL**: 
  - Production: `https://api.sqlaunchpad.com/api`
  - Local: `http://localhost:8080/api`
- **Swagger UI**: `https://api.sqlaunchpad.com/api/ui/`
- **OpenAPI Spec**: `https://api.sqlaunchpad.com/api/openapi.json`

## Authentication

### JWT Cookie-Based Authentication

The backend uses **JWT tokens stored in HTTP-only cookies** for authentication. The cookie is named `session_id`.

**Cookie Configuration:**
- **Name**: `session_id`
- **HttpOnly**: `true` (not accessible via JavaScript)
- **Secure**: `false` (set to `true` in production with HTTPS)
- **SameSite**: `Lax`
- **Max-Age**: `3600` (1 hour)

**Key Points:**
- Tokens are automatically sent with requests via `credentials: 'include'`
- No need to manually add `Authorization` headers
- Cookies are managed by the browser automatically
- CORS must be configured on backend to allow credentials
- Cookie expires after 1 hour - implement re-login or token refresh

### API Client Configuration

All API requests use `credentials: 'include'` to send cookies:

```typescript
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Sends cookies automatically
  body: JSON.stringify(data),
});
```

## API Endpoints

### Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/send/otp` | POST | Send OTP to user's email |
| `/api/verify/otp` | POST | Verify OTP and login (sets JWT cookie, returns user data) |
| `/api/logout` | POST | Logout user (clears session cookie) |

**Request Examples:**
```typescript
// Send OTP
POST /api/send/otp
{ "email": "user@example.com" }

// Verify OTP
POST /api/verify/otp
{ "email": "user@example.com", "otp": "123456" }
// Response: { message: "Login successful", user: { id, email, name, role, role_id } }

// Logout
POST /api/logout
// No body required (uses session cookie)
// Response: { message: "Logged out successfully" }
```

### Users

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/all` | GET | Get all users |
| `/api/user/{user_id}` | GET | Get user by ID (returns 404 if not found) |
| `/api/user/me` | GET | Get current logged-in user (uses session cookie, returns 401 if not authenticated) |
| `/api/user` | POST | Create user |
| `/api/user/{user_id}` | PUT | Update user (name, email, role) |
| `/api/user/{user_id}` | DELETE | Delete user (returns 404 if not found) |

**Response Format:**
```json
{
  "message": "details fetched succesfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "role_id": 1
  }
}
```

**Create User Payload:**
```json
{
  "name": "John Doe",
  "emailid": "john@example.com",
  "Role": 1  // 1=admin, 2=ops_manager, 3=deployment_engineer
}
```

### Organizations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/organization?organization_id=all` | GET | Get all organizations |
| `/api/organization?organization_id={id}` | GET | Get organization by ID |
| `/api/organization` | POST | Create organization |
| `/api/organization` | PUT | Update organization (id in body) |
| `/api/organization?organization_id={id}` | DELETE | Delete organization |

**Response Format:**
```json
{
  "message": "details fetched succesfully",
  "data": [
    {
      "org_id": 1,
      "name": "Organization Name",
      "description": "Description",
      "sector": "Technology",
      "unit_code": "ORG001",
      "organization_logo": "https://storage.googleapis.com/...",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**Create/Update Payload:**
```json
{
  "name": "Organization Name",
  "description": "Description text",
  "sector": "Technology",
  "unit_code": "ORG001",
  "organization_logo": "https://storage.googleapis.com/..."
}
```

### Sites

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/site/all` | GET | Get all sites with details |
| `/api/site` | POST | Create site |
| `/api/site` | PUT | Update site (id in body) |
| `/api/site?site_id={id}` | DELETE | Delete site |

**Response Format:**
```json
{
  "message": "Succesfully fetched sites",
  "data": [
    {
      "site_id": 1,
      "status": "approved",
      "field_name_1": { /* JSON field value */ },
      "field_name_2": { /* JSON field value */ }
    }
  ]
}
```

### Pages, Sections, Fields (Hierarchical Data)

The backend uses a hierarchical structure:
- **Site** → **Pages** → **Sections** → **Fields**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/page?page_name={name}&site_id={id}` | GET | Get page with sections/fields |
| `/api/page` | POST | Create page (can create site if site_id not provided) |
| `/api/page` | PUT | Update page (id in body) |
| `/api/section?page_id={id}&section_name={name}` | GET | Get sections |
| `/api/section` | POST | Create section |
| `/api/field` | GET/POST/PUT/DELETE | Field management (stores JSON values) |

**Get Page Response:**
```json
{
  "message": "Succesfully fetched the data",
  "data": {
    "page_id": 1,
    "page_name": "site_study",
    "site_id": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "sections": [
      {
        "section_id": 1,
        "section_name": "general_info",
        "page_id": 1,
        "fields": [
          {
            "field_id": 1,
            "field_name": "site_name",
            "field_value": { /* JSON object */ },
            "section_id": 1
          }
        ]
      }
    ]
  }
}
```

**Create Page Payload (nested structure):**
```json
{
  "page_name": "Home Page",
  "site_id": 1,
  "status": "created",
  "sections": [
    {
      "section_name": "Hero Banner",
      "fields": [
        {
          "field_name": "heading",
          "field_value": {
            "text": "Welcome",
            "color": "#000000"
          }
        }
      ]
    }
  ]
}
```

### File Uploads

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-upload-url` | POST | Generate signed URL for GCS upload |

**Request:**
```json
{
  "data_identifier": "org_123"  // lowercase, unique identifier
}
```

**Response:**
```json
{
  "message": "upload data",
  "data": {
    "upload_url": "https://storage.googleapis.com/launchpad_logo/org_123.svg?X-Goog-Algorithm=...",
    "public_url": "https://storage.googleapis.com/launchpad_logo/org_123.svg"
  }
}
```

**Important Notes:**
- File is stored as SVG format: `{data_identifier}.svg`
- Upload URL expires in 15 minutes
- Content-Type must be `image/png` for upload (even though stored as SVG)

**Upload Process:**
1. Call `/api/generate-upload-url` with data identifier
2. Upload file directly to `upload_url` using PUT request
3. Use `public_url` to display the file

## Service Files

### Updated Services

All services now use the centralized `apiClient` which handles:
- Cookie-based authentication
- Error handling
- Request/response transformation

**Services Updated:**
- ✅ `authService.ts` - OTP authentication
- ✅ `userService.ts` - User CRUD
- ✅ `fileUploadService.ts` - Signed URL generation
- ✅ `organizationService.ts` - Organization CRUD (NEW)

**Services Pending:**
- ⏳ `sitesService.ts` - Site management
- ⏳ `pageService.ts` - Page management (NEW)
- ⏳ `sectionService.ts` - Section management (NEW)
- ⏳ `fieldService.ts` - Field management (NEW)

## Environment Configuration

Create a `.env` file:

```bash
# Backend API URL (include /api in the URL)
# Local Development:
VITE_API_BASE_URL=http://localhost:8080/api

# Production:
# VITE_API_BASE_URL=https://[YOUR-APP-ENGINE-URL]/api

# Or using IP address:
# VITE_API_BASE_URL=http://12.12.121.2:8080/api

# Disable mock auth to use real backend
VITE_USE_MOCK_AUTH=false
```

## Development Mode

The app includes a **development mode** that uses mock data when:
- `VITE_USE_MOCK_AUTH=true` (or not set in dev)
- Backend API is unavailable

This allows frontend development without a running backend.

**Mock Authentication:**
- Enter any email
- Use OTP: `123456` (or any 6-digit code)
- Role is determined by email (admin/ops/engineer keywords)

## CORS Configuration

**Important:** The backend must be configured to:
1. Allow credentials: `Access-Control-Allow-Credentials: true`
2. Allow your frontend origin: `Access-Control-Allow-Origin: <frontend-url>`
3. Allow necessary headers: `Access-Control-Allow-Headers: Content-Type`

Example Flask CORS config:
```python
from flask_cors import CORS

CORS(app, 
     origins=["http://localhost:5173", "https://your-domain.com"],
     supports_credentials=True)
```

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Oops Something went Wrong !!!"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request / Validation Error
- `401`: Unauthorized (Missing or invalid session cookie)
- `500`: Internal Server Error

### Authentication Errors
- Missing cookie: `401 Unauthorized`
- Expired token: `401 Unauthorized` (token expires after 1 hour)
- Invalid token: `401 Unauthorized`

### Frontend Error Handling
The `apiClient` wraps responses in:
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    code?: string;
  };
}
```

Services handle errors and provide fallbacks in development mode.

## Next Steps

1. **Update sitesService** - Implement site CRUD operations
2. **Create page/section/field services** - Handle hierarchical data
3. **Update remaining services** - Connect all services to backend
4. **Test authentication flow** - Verify JWT cookie handling
5. **Test file uploads** - Verify signed URL generation and upload

## Testing

1. Set `VITE_USE_MOCK_AUTH=false` in `.env`
2. Ensure backend is running and accessible
3. Test login flow - cookies should be set automatically
4. Test API calls - verify cookies are sent with requests
5. Check browser DevTools → Network → Request Headers for cookies

## Troubleshooting

### Cookies Not Being Sent
- Verify `credentials: 'include'` is set on all fetch requests
- Check CORS configuration on backend
- Verify backend URL is correct

### 401 Unauthorized
- Check if JWT cookie is being set after login
- Verify cookie domain/path settings
- Check if cookie is expired

### CORS Errors
- Ensure backend allows your frontend origin
- Verify `supports_credentials=True` in backend CORS config
- Check browser console for specific CORS error

### API Not Found (404)
- Verify API base URL is correct
- Check endpoint paths match backend routes
- Ensure backend server is running

