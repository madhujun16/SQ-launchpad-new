/**
 * API Client for Google Cloud Backend
 * Handles all HTTP requests to the backend API
 */

import { API_CONFIG } from '@/config/api';

export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.url;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Build headers for API requests
   * Note: JWT tokens are stored in cookies by the Flask backend
   * The browser automatically sends cookies with credentials: 'include'
   * 
   * Supports hybrid authentication:
   * - Primary: Session cookie (when authentication is enabled)
   * - Fallback: X-User-Id header (for development when auth is disabled)
   */
  private async buildHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // JWT tokens are handled via cookies, not Authorization header
    // The backend sets cookies on login, and browser sends them automatically
    
    // Optional: Add X-User-Id header as fallback for development
    // Backend supports both cookie (primary) and header (fallback) authentication
    // This allows the endpoint to work in both production (cookie) and dev (header) modes
    const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
    if (BYPASS_AUTH || import.meta.env.VITE_USE_DEV_AUTH_HEADER === 'true') {
      try {
        // Try to get user ID from localStorage (set by AuthService)
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.id) {
            headers['X-User-Id'] = String(user.id);
            console.debug('🔧 Using X-User-Id header for authentication (dev mode)');
          }
        }
      } catch (error) {
        // Silently fail - cookie authentication will be used instead
        console.debug('Could not get user ID for X-User-Id header, using cookie auth');
      }
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private handleError(error: Error & { statusCode?: number; code?: string; details?: Record<string, unknown> }): ApiError {
    if (error.name === 'AbortError') {
      return {
        message: 'Request timeout',
        code: 'TIMEOUT',
        statusCode: 408,
      };
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    };
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useTimeout: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.buildHeaders(options.headers);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = useTimeout
        ? setTimeout(() => controller.abort(), this.timeout)
        : undefined;

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        credentials: 'include', // Include cookies for JWT authentication
      });

      if (timeoutId) clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.message || `Request failed with status ${response.status}`,
            statusCode: response.status,
            code: errorData.code,
            details: errorData,
          },
        };
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as T;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: this.handleError(error as Error & { statusCode?: number; code?: string; details?: Record<string, unknown> }),
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Upload file
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const formData = new FormData();
      formData.append(fieldName, file);

      // Add additional form data
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      // Build headers without Content-Type (browser will set it with boundary)
      const token = await this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2); // Double timeout for file uploads

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
        credentials: 'include', // Include cookies for JWT authentication
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            message: errorData.message || `Upload failed with status ${response.status}`,
            statusCode: response.status,
            code: errorData.code,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: this.handleError(error as Error & { statusCode?: number; code?: string; details?: Record<string, unknown> }),
      };
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export default APIClient;

