# Backend Connection Guide

## Service Account File (`sqlaunchpad-backend.json`)

**Important:** This Google Cloud service account JSON file is for **backend server authentication**, not for direct use in the frontend React app.

- **Backend Server Use**: Your GCP backend server uses this file to authenticate with Google Cloud services (Cloud Storage, Firestore, etc.)
- **Frontend Use**: The React app connects to your backend API using HTTP requests (already configured)

## Connecting Frontend to Backend

### Step 1: Configure API Base URL

Create a `.env` file in the project root (or update existing one):

```bash
# Option 1: Using IP address (for local/development backend)
VITE_API_BASE_URL=http://12.12.121.2:8080/api

# Option 2: Using domain (for production)
# VITE_API_BASE_URL=https://sqlaunchpad.com/api

# Option 3: Local backend
# VITE_API_BASE_URL=http://localhost:3000/api

# Disable mock auth to use real backend
VITE_USE_MOCK_AUTH=false
```

### Step 2: Restart Dev Server

After updating `.env`, restart the development server:

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## Service Account Details

The service account file contains:
- **Project ID**: `smartq-backend-784299`
- **Service Account Email**: `launchpad@smartq-backend-784299.iam.gserviceaccount.com`
- **Use Case**: Backend server authentication with GCP services

## Backend API Endpoints

The frontend is configured to use these endpoints:

| Service | Endpoint | Method |
|---------|----------|--------|
| Send OTP | `/api/send/otp` | POST |
| Verify OTP | `/api/verify/otp` | POST |
| List Users | `/api/user/all` | GET |
| Create User | `/api/user` | POST |
| Generate Upload URL | `/api/generate-upload-url` | POST |

## Testing Connection

1. Set `VITE_USE_MOCK_AUTH=false` in `.env`
2. Restart dev server
3. Try logging in - it will call your backend API
4. Check browser console for any CORS or connection errors

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your backend server has CORS enabled for:
- `http://localhost:5173` (development)
- Your production domain (if applicable)

### Connection Refused
- Verify the IP address/domain is correct
- Check if backend server is running
- Verify the port number matches your backend

### Authentication Issues
- Ensure backend is returning proper token format
- Check that token is being stored in localStorage
- Verify API response structure matches expected format

