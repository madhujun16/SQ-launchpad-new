// User Service - CRUD operations with backend API

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

// All user operations now use real backend API

// Role ID mapping
export const ROLE_IDS = {
  admin: 1,
  ops_manager: 2,
  deployment_engineer: 3,
} as const;

export const ROLE_NAMES: Record<number, 'admin' | 'ops_manager' | 'deployment_engineer'> = {
  1: 'admin',
  2: 'ops_manager',
  3: 'deployment_engineer',
};

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'ops_manager' | 'deployment_engineer';
  role_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  name: string;
  emailid: string;
  Role: number;
}

export interface CreateUserResponse {
  success: boolean;
  user?: UserWithRole;
  message?: string;
  error?: string;
}

export interface GetUsersResponse {
  success: boolean;
  users?: UserWithRole[];
  error?: string;
}

// Note: Authentication is handled via cookies (JWT) by the apiClient

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserWithRole[]> {
    try {
      const response = await apiClient.get<UserWithRole[] | { users: UserWithRole[] }>(API_ENDPOINTS.USERS.LIST);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch users');
      }

      // Transform API response to our format
      const users = Array.isArray(response.data) ? response.data : (response.data.users || []);
      return users.map((user: any) => this.transformUser(user));
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async createUser(
    name: string,
    email: string,
    role: 'admin' | 'ops_manager' | 'deployment_engineer'
  ): Promise<CreateUserResponse> {
    try {
      const payload: CreateUserPayload = {
        name,
        emailid: email,
        Role: ROLE_IDS[role],
      };

      const response = await apiClient.post<{ user?: any; message?: string }>(API_ENDPOINTS.USERS.CREATE, payload);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to create user',
        };
      }

      return {
        success: true,
        user: response.data?.user ? this.transformUser(response.data.user) : undefined,
        message: response.data?.message || 'User created successfully',
      };
    } catch (error) {
      console.error('createUser error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: 'admin' | 'ops_manager' | 'deployment_engineer'): Promise<UserWithRole[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error(`getUsersByRole(${role}) error:`, error);
      return [];
    }
  }

  /**
   * Get all ops managers
   */
  static async getOpsManagers(): Promise<UserWithRole[]> {
    return this.getUsersByRole('ops_manager');
  }

  /**
   * Get all deployment engineers
   */
  static async getDeploymentEngineers(): Promise<UserWithRole[]> {
    return this.getUsersByRole('deployment_engineer');
  }

  /**
   * Get all admins
   */
  static async getAdmins(): Promise<UserWithRole[]> {
    return this.getUsersByRole('admin');
  }

  /**
   * Transform API user response to our UserWithRole format
   */
  private static transformUser(apiUser: any): UserWithRole {
    // Determine role from role_id or role field
    let role: 'admin' | 'ops_manager' | 'deployment_engineer' = 'admin';
    
    if (apiUser.Role !== undefined) {
      role = ROLE_NAMES[apiUser.Role] || 'admin';
    } else if (apiUser.role_id !== undefined) {
      role = ROLE_NAMES[apiUser.role_id] || 'admin';
    } else if (apiUser.role) {
      role = apiUser.role;
    }

    return {
      id: apiUser.id?.toString() || apiUser.user_id?.toString() || '',
      user_id: apiUser.user_id?.toString() || apiUser.id?.toString() || '',
      email: apiUser.emailid || apiUser.email || '',
      full_name: apiUser.name || apiUser.full_name || '',
      role,
      role_id: apiUser.Role || apiUser.role_id,
      created_at: apiUser.created_at || new Date().toISOString(),
      updated_at: apiUser.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserWithRole | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: any;
      }>(API_ENDPOINTS.USERS.GET(userId));

      if (!response.success || !response.data) {
        if (response.error?.statusCode === 404) {
          return null; // User not found
        }
        throw new Error(response.error?.message || 'Failed to fetch user');
      }

      // Backend returns { message, data: {...} }
      return this.transformUser(response.data.data);
    } catch (error) {
      console.error('getUserById error:', error);
      return null;
    }
  }

  /**
   * Get current logged-in user
   */
  static async getCurrentUser(): Promise<UserWithRole | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: any;
      }>(API_ENDPOINTS.USERS.GET_ME);

      if (!response.success || !response.data) {
        if (response.error?.statusCode === 401) {
          return null; // Not authenticated
        }
        throw new Error(response.error?.message || 'Failed to fetch current user');
      }

      // Backend returns { message, data: {...} }
      return this.transformUser(response.data.data);
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  }

  /**
   * Update a user
   */
  static async updateUser(
    userId: string,
    updates: Partial<{ name: string; email: string; role: 'admin' | 'ops_manager' | 'deployment_engineer' }>
  ): Promise<CreateUserResponse> {
    try {
      // Build update payload
      const payload: any = {};
      if (updates.name) payload.name = updates.name;
      if (updates.email) payload.emailid = updates.email; // Backend expects emailid
      if (updates.role) payload.Role = ROLE_IDS[updates.role];

      const response = await apiClient.put<{
        message: string;
        data: any;
      }>(API_ENDPOINTS.USERS.UPDATE(userId), payload);

      if (!response.success) {
        if (response.error?.statusCode === 404) {
          return { success: false, error: 'User not found' };
        }
        return {
          success: false,
          error: response.error?.message || 'Failed to update user',
        };
      }

      return {
        success: true,
        user: response.data?.data ? this.transformUser(response.data.data) : undefined,
        message: response.data?.message || 'User updated successfully',
      };
    } catch (error) {
      console.error('updateUser error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(userId));
      
      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to delete user',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('deleteUser error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }
}

export default UserService;
