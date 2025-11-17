# Google Cloud Backend API Integration Guide

This guide explains how to integrate and use the Google Cloud Backend API in your React application.

## 🌐 Backend URL

Your backend API is hosted at:
```
https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com
```

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google Cloud Backend API Configuration
VITE_BACKEND_API_URL=https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com
VITE_API_TIMEOUT=30000
```

### 2. Vite Proxy Configuration

The Vite development server is configured to proxy API requests:

- **Local Development**: Requests to `/api/*` are proxied to your backend
- **Production**: Direct requests to the backend URL

This avoids CORS issues during development.

## 📁 File Structure

```
src/
├── config/
│   └── api.ts                    # API configuration and endpoints
├── services/
│   ├── apiClient.ts              # Main API client class
│   └── backendApi.example.ts    # Example service implementations
└── hooks/
    └── useBackendApi.ts          # React hook for API calls
```

## 🚀 Usage Examples

### Method 1: Using the React Hook (Recommended)

The easiest way to make API calls in React components:

```typescript
import { useBackendApi } from '@/hooks/useBackendApi';

function MyComponent() {
  const { loading, error, data, get, post } = useBackendApi({
    showSuccessToast: true,
    showErrorToast: true,
  });

  const fetchData = async () => {
    const response = await get('/your-endpoint');
    if (response.success) {
      console.log('Data:', response.data);
    }
  };

  const createItem = async (itemData: any) => {
    const response = await post('/items', itemData);
    if (response.success) {
      console.log('Item created:', response.data);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={() => createItem({ name: 'Test' })}>Create Item</button>
    </div>
  );
}
```

### Method 2: Using API Client Directly

For use outside React components or in services:

```typescript
import { apiClient } from '@/services/apiClient';

// GET request
async function fetchUsers() {
  const response = await apiClient.get('/users');
  if (response.success) {
    return response.data;
  } else {
    console.error('Error:', response.error);
    return null;
  }
}

// POST request
async function createUser(userData: any) {
  const response = await apiClient.post('/users', userData);
  return response;
}

// PUT request
async function updateUser(userId: string, userData: any) {
  const response = await apiClient.put(`/users/${userId}`, userData);
  return response;
}

// DELETE request
async function deleteUser(userId: string) {
  const response = await apiClient.delete(`/users/${userId}`);
  return response;
}
```

### Method 3: Using Service Classes (Best for Organization)

Create service classes for different domains:

```typescript
import { apiClient } from '@/services/apiClient';

export class ProductService {
  static async getProducts(page: number = 1, limit: number = 10) {
    return apiClient.get(`/products?page=${page}&limit=${limit}`);
  }

  static async getProduct(productId: string) {
    return apiClient.get(`/products/${productId}`);
  }

  static async createProduct(productData: any) {
    return apiClient.post('/products', productData);
  }

  static async updateProduct(productId: string, productData: any) {
    return apiClient.put(`/products/${productId}`, productData);
  }

  static async deleteProduct(productId: string) {
    return apiClient.delete(`/products/${productId}`);
  }
}

// Usage in component
import { ProductService } from '@/services/productService';

const products = await ProductService.getProducts(1, 20);
```

## 🔐 Authentication

The API client automatically includes the Supabase authentication token in all requests:

```typescript
Authorization: Bearer <supabase-access-token>
```

If a user is logged in via Supabase, their token will be automatically attached to all backend API requests.

## 📤 File Upload Example

```typescript
import { apiClient } from '@/services/apiClient';

function FileUploadComponent() {
  const handleFileUpload = async (file: File) => {
    const response = await apiClient.uploadFile(
      '/upload',
      file,
      'file',
      {
        category: 'documents',
        userId: '123',
      }
    );

    if (response.success) {
      console.log('File uploaded:', response.data);
    } else {
      console.error('Upload failed:', response.error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }}
    />
  );
}
```

## 🏥 Health Check

Check if your backend is running:

```typescript
import { apiClient } from '@/services/apiClient';

const isHealthy = await apiClient.healthCheck();
console.log('Backend is healthy:', isHealthy);
```

## 🛠️ Error Handling

### Option 1: Component-level Error Handling

```typescript
const { error, get } = useBackendApi({
  showErrorToast: true,  // Show toast on error
  onError: (error) => {
    console.error('API Error:', error);
    // Custom error handling
  },
});
```

### Option 2: Try-Catch Error Handling

```typescript
import { apiClient } from '@/services/apiClient';

async function fetchData() {
  const response = await apiClient.get('/data');
  
  if (!response.success) {
    // Handle specific error codes
    switch (response.error?.statusCode) {
      case 401:
        // Redirect to login
        window.location.href = '/auth';
        break;
      case 403:
        console.error('Permission denied');
        break;
      case 404:
        console.error('Resource not found');
        break;
      default:
        console.error('Error:', response.error?.message);
    }
    return null;
  }
  
  return response.data;
}
```

## 🔄 API Response Format

All API responses follow this structure:

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

## 🧪 Testing the Integration

### 1. Test Backend Connection

```typescript
import { apiClient } from '@/services/apiClient';

// In your component or console
const testConnection = async () => {
  console.log('Testing backend connection...');
  
  const response = await apiClient.get('/health');
  
  if (response.success) {
    console.log('✅ Backend is connected!');
  } else {
    console.error('❌ Backend connection failed:', response.error);
  }
};

testConnection();
```

### 2. Test with DevTools

Open browser console and run:

```javascript
// Using the API client
const { apiClient } = await import('./src/services/apiClient.ts');
const response = await apiClient.get('/health');
console.log(response);
```

## 📝 Adding New Endpoints

Edit `src/config/api.ts` to add new endpoints:

```typescript
export const API_ENDPOINTS = {
  HEALTH: '/health',
  
  // Add your endpoints here
  PRODUCTS: {
    LIST: '/products',
    GET: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  
  ORDERS: {
    LIST: '/orders',
    GET: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
  },
};
```

## 🚦 Development vs Production

### Development (localhost:8080)
- Requests to `/api/*` are proxied to your backend
- CORS is handled by the proxy
- Hot reload enabled

### Production
- Direct requests to `https://launchpad-backend-dot-smartq-backend-784299.ew.r.appspot.com`
- CORS must be configured on your backend to allow your frontend domain
- Requests include authentication tokens

## ⚡ Performance Tips

1. **Use React Query** for better caching and state management:
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   import { apiClient } from '@/services/apiClient';

   function useUsers() {
     return useQuery({
       queryKey: ['users'],
       queryFn: () => apiClient.get('/users'),
     });
   }
   ```

2. **Implement request cancellation** for long-running requests

3. **Add request/response interceptors** in `apiClient.ts` for logging

## 🔒 Security Considerations

1. **Never expose API keys** in frontend code
2. **Always validate** responses from the backend
3. **Use HTTPS** in production (already configured)
4. **Implement rate limiting** on your backend
5. **Validate authentication tokens** on the backend

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend is running: Visit the health endpoint
3. Check network tab in DevTools
4. Verify authentication token is being sent
5. Check CORS configuration on your backend

## 🎯 Next Steps

1. Replace example endpoints in `src/config/api.ts` with your actual API endpoints
2. Create service classes for your domain models
3. Implement proper error boundaries in React
4. Add request/response logging for debugging
5. Set up monitoring and analytics

---

For more examples, see `src/services/backendApi.example.ts`

