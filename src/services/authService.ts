// Authentication Service - OTP based authentication

const API_BASE_URL = 'https://sqlaunchpad.com/api';

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
