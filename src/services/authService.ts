// Authentication Service - OTP based authentication

// API URL - Always uses production API
// Production: https://api.sqlaunchpad.com/api
// Can be overridden via VITE_API_BASE_URL environment variable if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.sqlaunchpad.com/api';

// All authentication now uses real backend API

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    roles?: Array<{ role: string }>;
  };
}

export const AuthService = {
  /**
   * Send OTP to the user's email
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/send/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include', // Include cookies for CORS
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: Failed to send OTP`,
        };
      }

      // Backend returns: { message: "OTP sent successfully to user@example.com" }
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'OTP sent successfully',
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      
      // Check if it's a network/connection error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: `Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error - failed to send OTP',
      };
    }
  },

  /**
   * Verify OTP and authenticate user
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
        credentials: 'include', // Include cookies - JWT will be set in cookies by backend
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: Invalid OTP`,
        };
      }

      // Backend returns: { message: "Login successful", user: {...} }
      // JWT token is set in HTTP-only cookie named 'session_id'
      // Cookie settings: HttpOnly, SameSite=Lax, Max-Age=3600 (1 hour)
      // User data is now included in the response
      
      // Parse response data
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
      
      const userData = data.user || {
        email: email, // Fallback to email from request
      };
      
      return {
        success: true,
        message: data.message || 'Login successful',
        token: 'cookie-based', // Token is in session_id cookie, not in response
        user: userData,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      // Check if it's a network/connection error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: `Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend server is running.`,
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error - failed to verify OTP',
      };
    }
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Store auth token
   */
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove auth token
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get stored user data
   */
  getStoredUser(): VerifyOtpResponse['user'] | null {
    const userData = localStorage.getItem('auth_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Store user data
   */
  setStoredUser(user: VerifyOtpResponse['user']): void {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  /**
   * Remove stored user data
   */
  removeStoredUser(): void {
    localStorage.removeItem('auth_user');
  },

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    this.removeToken();
    this.removeStoredUser();
    localStorage.removeItem('currentRole');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  },

  /**
   * Get current logged-in user from backend
   * Uses /api/user/me endpoint
   */
  async getCurrentUser(): Promise<VerifyOtpResponse['user'] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          this.clearAuth();
          return null;
        }
        throw new Error(`HTTP ${response.status}: Failed to get user`);
      }

      const data = await response.json();
      
      // Backend returns: { message: "...", data: { id, email, name, role, role_id } }
      const userData = data.data || data.user;
      
      if (userData) {
        // Store user data
        this.setStoredUser(userData);
        return userData;
      }

      return null;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  },

  /**
   * Logout user
   * Calls backend logout endpoint to clear session cookie
   */
  async logout(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to logout',
        };
      }

      // Clear local storage
      this.clearAuth();

      return {
        success: true,
        message: data.message || 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Clear local storage even if API call fails
      this.clearAuth();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during logout',
      };
    }
  },
};

export default AuthService;
