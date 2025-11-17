# 🚀 Quick Start: Google Cloud Backend API Integration

Your Google Cloud backend API has been successfully integrated! Here's how to start using it.

## ✅ What's Been Set Up

1. **API Configuration** (`src/config/api.ts`)
   - Backend URL configured
   - Environment variable support
   - Automatic dev/prod switching

2. **API Client** (`src/services/apiClient.ts`)
   - Full REST client (GET, POST, PUT, PATCH, DELETE)
   - Automatic authentication token injection
   - Error handling and timeout management
   - File upload support

3. **React Hook** (`src/hooks/useBackendApi.ts`)
   - Easy-to-use hook for React components
   - Built-in loading/error states
   - Toast notifications

4. **Vite Proxy** (`vite.config.ts`)
   - Development proxy configured
   - CORS issues resolved for local dev

## 🏃 Quick Start (3 Minutes)

### Step 1: Create a `.env.local` file in your root directory

```bash
# In your project root
touch .env.local
```

Add this content:
```env
VITE_BACKEND_API_URL=https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com
VITE_API_TIMEOUT=30000
```

### Step 2: Test the Connection

Add this to any React component or create a new test page:

```typescript
import { useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

function TestConnection() {
  useEffect(() => {
    const test = async () => {
      console.log('Testing backend connection...');
      const response = await apiClient.get('/health');
      
      if (response.success) {
        console.log('✅ Connected!', response.data);
      } else {
        console.error('❌ Failed:', response.error);
      }
    };
    
    test();
  }, []);

  return <div>Check console for results</div>;
}
```

### Step 3: Make Your First API Call

**Option A: Using the Hook (Easiest)**

```typescript
import { useBackendApi } from '@/hooks/useBackendApi';

function MyComponent() {
  const { loading, data, get } = useBackendApi();

  const fetchData = async () => {
    await get('/your-endpoint');
  };

  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

**Option B: Using API Client Directly**

```typescript
import { apiClient } from '@/services/apiClient';

// GET
const response = await apiClient.get('/endpoint');

// POST
const response = await apiClient.post('/endpoint', { key: 'value' });

// Always check response.success
if (response.success) {
  console.log('Data:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## 🧪 Test Component

We've created a test dashboard component for you!

Import it anywhere to test your backend:

```typescript
import BackendApiExample from '@/components/BackendApiExample';

// Use it in your app
<BackendApiExample />
```

This component provides:
- Health check status
- Quick endpoint testing
- Custom endpoint testing
- Response visualization

## 📡 Example API Calls

### Health Check
```typescript
import { apiClient } from '@/services/apiClient';

const isHealthy = await apiClient.healthCheck();
console.log('Backend is healthy:', isHealthy);
```

### GET Request
```typescript
const response = await apiClient.get('/users');
if (response.success) {
  const users = response.data;
}
```

### POST Request
```typescript
const response = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### File Upload
```typescript
const response = await apiClient.uploadFile(
  '/upload',
  file,
  'file',
  { description: 'My file' }
);
```

## 🔑 Authentication

Authentication is **automatic**! 

If a user is logged in via Supabase, their auth token is automatically included in all requests as:
```
Authorization: Bearer <token>
```

No additional code needed!

## 🛠️ Common Endpoints to Add

Edit `src/config/api.ts` to add your endpoints:

```typescript
export const API_ENDPOINTS = {
  HEALTH: '/health',
  
  // Add your endpoints here
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  
  // With dynamic IDs
  USER: (id: string) => `/users/${id}`,
  PRODUCT: (id: string) => `/products/${id}`,
};
```

Then use them:
```typescript
import { API_ENDPOINTS } from '@/config/api';

await apiClient.get(API_ENDPOINTS.USERS);
await apiClient.get(API_ENDPOINTS.USER('123'));
```

## 🌐 Development vs Production

### Development (localhost:8080)
- Requests to `/api/*` → Proxied to backend
- No CORS issues
- Debug logging enabled

### Production
- Direct requests to backend URL
- CORS must be configured on backend
- Optimized performance

## ⚠️ Important Notes

1. **CORS**: Make sure your backend allows requests from your frontend domain
2. **Endpoints**: Replace example endpoints with your actual API endpoints
3. **Error Handling**: Always check `response.success` before using data
4. **Authentication**: Backend should validate the Bearer token

## 📚 Full Documentation

For detailed documentation, see:
- `BACKEND_API_INTEGRATION.md` - Complete integration guide
- `src/services/backendApi.example.ts` - Service class examples
- `src/components/BackendApiExample.tsx` - Test component

## 🐛 Troubleshooting

### Backend not responding?
```typescript
// Check health
const isHealthy = await apiClient.healthCheck();
console.log(isHealthy);

// Check in browser
fetch('https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com/health')
  .then(r => r.json())
  .then(console.log);
```

### CORS errors?
- Make sure your backend has CORS configured
- In development, use the `/api` prefix (it's proxied)
- Check Vite console for proxy errors

### Auth token not sent?
```typescript
// Check if user is logged in
import { useAuth } from '@/hooks/useAuth';
const { user, session } = useAuth();
console.log('User:', user);
console.log('Has token:', !!session?.access_token);
```

## 🎯 Next Steps

1. ✅ Test connection with `/health` endpoint
2. ✅ Add your actual API endpoints to `src/config/api.ts`
3. ✅ Create service classes for your domain models
4. ✅ Use `useBackendApi` hook in your components
5. ✅ Handle errors appropriately
6. ✅ Configure CORS on your backend

---

**Need Help?** 
- Check `BACKEND_API_INTEGRATION.md` for detailed examples
- Use the `BackendApiExample` component to test endpoints
- Check browser console for detailed error messages

