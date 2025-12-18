/**
 * API Configuration for Render Backend
 */

// Centralized API Base URL - Change this to update all API endpoints
// This should be the full base URL including /api (e.g., https://sq-launchpad-backend.onrender.com/api)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sq-launchpad-backend.onrender.com/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  // Return the base URL directly (should already include /api)
  get url() {
    return this.baseURL;
  }
};

// API Endpoints - Matching Flask Backend (Connexion/OpenAPI)
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',
  
  // Authentication
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout', // POST - Logout user
    SEND_OTP: '/send/otp',
    VERIFY_OTP: '/verify/otp', // Now returns user data
  },
  
  // Users
  USERS: {
    LIST: '/user/all',
    GET: (id: string) => `/user/${id}`,
    GET_ME: '/user/me', // Get current logged-in user
    CREATE: '/user',
    UPDATE: (id: string) => `/user/${id}`,
    DELETE: (id: string) => `/user/${id}`,
  },
  
  // Organizations
  ORGANIZATIONS: {
    LIST: (organizationId?: string | 'all') => {
      const id = organizationId || 'all';
      return `/organization?organization_id=${id}`;
    },
    CREATE: '/organization',
    UPDATE: '/organization', // PUT with id in body
    DELETE: (id: string) => `/organization?organization_id=${id}`,
  },
  
  // Sites
  SITES: {
    LIST: '/site/all',
    CREATE: '/site',
    UPDATE: '/site', // PUT with id in body
    DELETE: (id: string) => `/site?site_id=${id}`,
  },
  
  // Pages (belong to sites) - uses query params
  PAGES: {
    GET: (pageName: string, siteId: string | number) => 
      `/page?page_name=${pageName}&site_id=${siteId}`,
    CREATE: '/page',
    UPDATE: '/page', // PUT with id in body
  },
  
  // Sections (belong to pages) - uses query params
  SECTIONS: {
    GET: (pageId: string | number, sectionName?: string) => {
      const params = new URLSearchParams({ page_id: String(pageId) });
      if (sectionName) params.append('section_name', sectionName);
      return `/section?${params.toString()}`;
    },
    CREATE: '/section',
  },
  
  // File Upload
  UPLOAD: {
    GENERATE_URL: '/generate-upload-url',
  },
};

export default API_CONFIG;

