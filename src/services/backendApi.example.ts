/**
 * Example service demonstrating how to use the Google Cloud Backend API
 * This file shows various patterns for integrating with your backend
 */

import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/api';

// Example: Type definitions for your backend responses
interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Example: User Service
 * Demonstrates CRUD operations with the backend API
 */
export class UserService {
  /**
   * Get all users with pagination
   */
  static async getUsers(page: number = 1, pageSize: number = 10) {
    return apiClient.get<PaginatedResponse<User>>(
      `${API_ENDPOINTS.USERS.LIST}?page=${page}&pageSize=${pageSize}`
    );
  }

  /**
   * Get a single user by ID
   */
  static async getUser(userId: string) {
    return apiClient.get<User>(API_ENDPOINTS.USERS.GET(userId));
  }

  /**
   * Create a new user
   */
  static async createUser(userData: Partial<User>) {
    return apiClient.post<User>(API_ENDPOINTS.USERS.CREATE, userData);
  }

  /**
   * Update an existing user
   */
  static async updateUser(userId: string, userData: Partial<User>) {
    return apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE(userId), userData);
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string) {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
  }
}

/**
 * Example: Health Check Service
 */
export class HealthService {
  /**
   * Check backend health status
   */
  static async checkHealth() {
    return apiClient.get('/health');
  }

  /**
   * Get backend version info
   */
  static async getVersion() {
    return apiClient.get('/version');
  }
}

/**
 * Example: File Upload Service
 */
export class FileService {
  /**
   * Upload a file to the backend
   */
  static async uploadFile(file: File, metadata?: Record<string, any>) {
    return apiClient.uploadFile('/upload', file, 'file', metadata);
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(files: File[]) {
    const uploadPromises = files.map(file => 
      apiClient.uploadFile('/upload', file)
    );
    return Promise.all(uploadPromises);
  }
}

/**
 * Example: Custom endpoint with authentication
 */
export class CustomService {
  /**
   * Example of a custom API call with specific parameters
   */
  static async customEndpoint(params: Record<string, any>) {
    return apiClient.post('/custom-endpoint', params);
  }

  /**
   * Example of handling errors specifically
   */
  static async withErrorHandling(data: any) {
    const response = await apiClient.post('/some-endpoint', data);
    
    if (!response.success) {
      // Custom error handling
      console.error('API Error:', response.error);
      
      // Handle specific error codes
      if (response.error?.statusCode === 401) {
        // Handle unauthorized
        window.location.href = '/auth';
      } else if (response.error?.statusCode === 403) {
        // Handle forbidden
        throw new Error('You do not have permission to perform this action');
      }
    }
    
    return response;
  }
}

// Export all services
export default {
  UserService,
  HealthService,
  FileService,
  CustomService,
};

