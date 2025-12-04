/**
 * API Configuration for Google Cloud Backend
 */

// Get API URL from environment variables
// Default: http://localhost:8080/api (local) or https://sqlaunchpad.com/api (production)
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  // Use proxy in development, direct URL in production
  isDevelopment: import.meta.env.DEV,
  // In development, we use '/api' which gets proxied by Vite
  // In production, we use the full URL
  get url() {
    // If baseURL already includes /api, use it as-is
    if (this.baseURL.includes('/api')) {
      return this.isDevelopment ? '/api' : this.baseURL;
    }
    // Otherwise append /api
    return this.isDevelopment ? '/api' : `${this.baseURL}/api`;
  }
};

// API Endpoints - Matching Flask Backend (Connexion/OpenAPI)
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',
  
  // Authentication
  AUTH: {
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    SEND_OTP: '/api/send/otp',
    VERIFY_OTP: '/api/verify/otp',
  },
  
  // Users
  USERS: {
    LIST: '/api/user/all',
    GET: (id: string) => `/api/user/${id}`,
    CREATE: '/api/user',
    UPDATE: (id: string) => `/api/user/${id}`,
    DELETE: (id: string) => `/api/user/${id}`,
  },
  
  // Organizations
  ORGANIZATIONS: {
    LIST: (organizationId?: string | 'all') => {
      const id = organizationId || 'all';
      return `/api/organization?organization_id=${id}`;
    },
    CREATE: '/api/organization',
    UPDATE: '/api/organization', // PUT with id in body
    DELETE: (id: string) => `/api/organization?organization_id=${id}`,
  },
  
  // Sites
  SITES: {
    LIST: '/api/site/all',
    CREATE: '/api/site',
    UPDATE: '/api/site', // PUT with id in body
    DELETE: (id: string) => `/api/site?site_id=${id}`,
  },
  
  // Pages (belong to sites) - uses query params
  PAGES: {
    GET: (pageName: string, siteId: string | number) => 
      `/api/page?page_name=${pageName}&site_id=${siteId}`,
    CREATE: '/api/page',
    UPDATE: '/api/page', // PUT with id in body
  },
  
  // Sections (belong to pages) - uses query params
  SECTIONS: {
    GET: (pageId: string | number, sectionName?: string) => {
      const params = new URLSearchParams({ page_id: String(pageId) });
      if (sectionName) params.append('section_name', sectionName);
      return `/api/section?${params.toString()}`;
    },
    CREATE: '/api/section',
  },
  
  // File Upload
  UPLOAD: {
    GENERATE_URL: '/api/generate-upload-url',
  },
};

export default API_CONFIG;

