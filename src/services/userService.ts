// User Service - CRUD operations with sqlaunchpad.com API

import { AuthService } from './authService';

const API_BASE_URL = 'https://sqlaunchpad.com/api';

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

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = AuthService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserWithRole[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/all`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch users:', data);
        throw new Error(data.message || data.error || 'Failed to fetch users');
      }

      // Transform API response to our format
      const users = Array.isArray(data) ? data : (data.users || []);
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

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Failed to create user',
        };
      }

      return {
        success: true,
        user: this.transformUser(data.user || data),
        message: data.message || 'User created successfully',
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
   * Delete a user (if API supports it)
   */
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement when API endpoint is available
    console.warn('deleteUser not implemented - need backend API endpoint');
    return { success: false, error: 'Delete user API not implemented' };
  }
}

export default UserService;
