// User Service - CRUD operations with backend API

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

// Development mode check
const isDevMode = () => import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

// Mock users for development
const MOCK_USERS: UserWithRole[] = [
  {
    id: '1',
    user_id: '1',
    email: 'admin@smartq.com',
    full_name: 'Admin User',
    role: 'admin',
    role_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '2',
    email: 'ops.manager@smartq.com',
    full_name: 'Operations Manager',
    role: 'ops_manager',
    role_id: 2,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    user_id: '3',
    email: 'deploy.engineer@smartq.com',
    full_name: 'Deployment Engineer',
    role: 'deployment_engineer',
    role_id: 3,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

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
  // Local mock users storage for dev mode
  private static mockUsers: UserWithRole[] = [...MOCK_USERS];

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserWithRole[]> {
    // Dev mode - return mock users
    if (isDevMode()) {
      console.log('🔧 DEV MODE: Returning mock users');
      return [...this.mockUsers];
    }

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
      
      // Fallback to mock users in dev mode
      if (isDevMode()) {
        console.log('🔧 API unavailable - using mock users');
        return [...this.mockUsers];
      }
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
    // Dev mode - add to mock users
    if (isDevMode()) {
      console.log('🔧 DEV MODE: Creating mock user', { name, email, role });
      const newUser: UserWithRole = {
        id: `mock-${Date.now()}`,
        user_id: `mock-${Date.now()}`,
        email,
        full_name: name,
        role,
        role_id: ROLE_IDS[role],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.mockUsers.push(newUser);
      return {
        success: true,
        user: newUser,
        message: 'DEV MODE: User created successfully',
      };
    }

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
   * Update a user (if API supports it)
   */
  static async updateUser(
    userId: string,
    updates: Partial<{ name: string; email: string; role: 'admin' | 'ops_manager' | 'deployment_engineer' }>
  ): Promise<CreateUserResponse> {
    // TODO: Implement when API endpoint is available
    console.warn('updateUser not implemented - need backend API endpoint');
    return { success: false, error: 'Update user API not implemented' };
  }

  /**
   * Delete a user
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    // Dev mode - remove from mock users
    if (isDevMode()) {
      console.log('🔧 DEV MODE: Deleting mock user', userId);
      const index = this.mockUsers.findIndex(u => u.id === userId);
      if (index !== -1) {
        this.mockUsers.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'User not found' };
    }

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
