import { supabase } from '@/integrations/supabase/client';

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'ops_manager' | 'deployment_engineer';
  created_at: string;
  updated_at: string;
}

export class UserService {
  // Get all users with their roles
  static async getAllUsers(): Promise<UserWithRole[]> {
    try {
      // OPTIMIZED: Single query with JOIN to get all users and their roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          created_at,
          updated_at,
          user_roles!inner(role)
        `)
        .order('full_name');

      if (usersError) {
        console.error('Error loading users with roles:', usersError);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        console.log('No users found');
        return [];
      }

      // Transform the data to match the expected format
      const usersWithRoles: UserWithRole[] = [];
      usersData.forEach((user: any) => {
        if (user.user_roles && user.user_roles.length > 0) {
          user.user_roles.forEach((roleData: any) => {
            usersWithRoles.push({
              id: user.id, // This is profiles.id - use this for foreign key references
              user_id: user.user_id, // This is auth.users.id - keep for compatibility
              email: user.email,
              full_name: user.full_name || user.email,
              role: roleData.role,
              created_at: user.created_at,
              updated_at: user.updated_at
            });
          });
        }
      });

      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get users by specific role
  static async getUsersByRole(role: 'admin' | 'ops_manager' | 'deployment_engineer'): Promise<UserWithRole[]> {
    try {
      // OPTIMIZED: Single query with JOIN and role filter
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          created_at,
          updated_at,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', role)
        .order('full_name');

      if (usersError) {
        console.error('Error loading users by role:', usersError);
        return [];
      }

      if (!usersData || usersData.length === 0) {
        return [];
      }

      // Transform the data to match the expected format
      const usersWithRole: UserWithRole[] = usersData.map((user: any) => ({
        id: user.id, // This is profiles.id - use this for foreign key references
        user_id: user.user_id, // This is auth.users.id - keep for compatibility
        email: user.email,
        full_name: user.full_name || user.email,
        role: role, // We know the role since we filtered by it
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      return usersWithRole;
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      return [];
    }
  }

  // Get Ops Managers specifically
  static async getOpsManagers(): Promise<UserWithRole[]> {
    return this.getUsersByRole('ops_manager');
  }

  // Get Deployment Engineers specifically
  static async getDeploymentEngineers(): Promise<UserWithRole[]> {
    return this.getUsersByRole('deployment_engineer');
  }
}
