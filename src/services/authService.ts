// Authentication Service - OTP based authentication

// API URL - can be configured via environment variable
// Examples:
//   VITE_API_BASE_URL=https://sqlaunchpad.com/api
//   VITE_API_BASE_URL=http://12.12.121.2:8080/api
//   VITE_API_BASE_URL=http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sqlaunchpad.com/api';

// Development mode - set to true to bypass API and use mock auth
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

// Mock OTP for development (any 6-digit code works)
const MOCK_OTP = '123456';

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
   * Check if running in dev mode with mock auth
   */
  isDevMode(): boolean {
    return DEV_MODE;
  },

  /**
   * Send OTP to the user's email
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    // Development mode - skip API call
    if (DEV_MODE) {
      console.log('🔧 DEV MODE: Mock OTP sent to', email);
      console.log('🔑 Use OTP: 123456 (or any 6-digit code)');
      return {
        success: true,
        message: `DEV MODE: Use OTP "123456" to login`,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/send/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: Failed to send OTP`,
        };
      }

      return {
        success: true,
        message: data.message || 'OTP sent successfully',
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      
      // If API fails, offer dev mode fallback
      if (import.meta.env.DEV) {
        console.log('🔧 API unavailable - switching to DEV MODE');
        console.log('🔑 Use OTP: 123456 to login');
        return {
          success: true,
          message: `API offline - DEV MODE: Use OTP "123456" to login`,
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
    // Development mode - accept any 6-digit OTP
    if (DEV_MODE || (import.meta.env.DEV && otp.length === 6)) {
      console.log('🔧 DEV MODE: Mock login for', email);
      
      // Create mock user based on email
      const isAdmin = email.includes('admin');
      const isOpsManager = email.includes('ops') || email.includes('manager');
      const isEngineer = email.includes('engineer') || email.includes('deploy');
      
      let role: 'admin' | 'ops_manager' | 'deployment_engineer' = 'admin';
      if (isOpsManager) role = 'ops_manager';
      if (isEngineer) role = 'deployment_engineer';
      
      const mockUser = {
        id: `dev-user-${Date.now()}`,
        email: email,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: role,
        roles: [{ role }],
      };

      return {
        success: true,
        message: 'DEV MODE: Login successful',
        token: `dev-token-${Date.now()}`,
        user: mockUser,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/verify/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: Invalid OTP`,
        };
      }

      return {
        success: true,
        message: data.message || 'OTP verified successfully',
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      // If API fails in dev, use mock auth
      if (import.meta.env.DEV && otp.length === 6) {
        console.log('🔧 API unavailable - using DEV MODE login');
        const mockUser = {
          id: `dev-user-${Date.now()}`,
          email: email,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: 'admin',
          roles: [{ role: 'admin' }],
        };
        return {
          success: true,
          message: 'DEV MODE: Login successful (API offline)',
          token: `dev-token-${Date.now()}`,
          user: mockUser,
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
};

export default AuthService;
