/**
 * API Configuration for Google Cloud Backend
 */

// Get API URL from environment variables
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_API_URL || 'https://sqlaunchpad.com',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  // Use proxy in development, direct URL in production
  isDevelopment: import.meta.env.DEV,
  // In development, we use '/api' which gets proxied by Vite
  // In production, we use the full URL
  get url() {
    return this.isDevelopment ? '/api' : this.baseURL;
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Backend API endpoints
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    REQUEST_OTP: '/api/send/otp',
    VERIFY_OTP: '/api/verify/otp',
  },
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  // Add more endpoints as needed
};

export default API_CONFIG;

