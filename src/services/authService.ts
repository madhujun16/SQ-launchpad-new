/**
 * Authentication Service for Backend API
 * Handles login, logout, and token management
 */

import { apiClient, ApiResponse } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password?: string;
  otp?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'backend_auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'backend_refresh_token';
  private static readonly USER_KEY = 'backend_user';

  /**
   * Login with email and password
   */
  static async loginWithPassword(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        email,
        password,
        loginType: 'password',
      }
    );

    if (response.success && response.data) {
      this.storeAuthData(response.data);
    }

    return response;
  }

  /**
   * Login with email and OTP
   */
  static async loginWithOTP(
    email: string,
    otp: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        email,
        otp,
      }
    );

    if (response.success && response.data) {
      this.storeAuthData(response.data);
    }

    return response;
  }

  /**
   * Request OTP for email - sends OTP to user's email
   */
  static async requestOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, { email });
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Clear local storage regardless of API response
    this.clearAuthData();
    
    return response;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return {
        success: false,
        error: {
          message: 'No refresh token available',
          code: 'NO_REFRESH_TOKEN',
        },
      };
    }

    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (response.success && response.data) {
      this.storeAuthData(response.data);
    }

    return response;
  }

  /**
   * Validate current token
   */
  static async validateToken(): Promise<ApiResponse<{ valid: boolean; user?: any }>> {
    return apiClient.get(API_ENDPOINTS.AUTH.VALIDATE);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    const expiresAt = localStorage.getItem('backend_token_expires_at');
    if (expiresAt) {
      const expiresAtTime = parseInt(expiresAt);
      if (Date.now() >= expiresAtTime) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get current user
   */
  static getCurrentUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private static storeAuthData(data: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    
    if (data.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    }
    
    if (data.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    }

    // Store expiration time if provided
    if (data.expiresIn) {
      const expiresAt = Date.now() + data.expiresIn * 1000;
      localStorage.setItem('backend_token_expires_at', expiresAt.toString());
    }
  }

  /**
   * Clear authentication data
   */
  private static clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('backend_token_expires_at');
  }
}

export default AuthService;

