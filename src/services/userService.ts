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
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) throw userRolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRole[] = [];
      
      for (const profile of profilesData || []) {
        const userRoles = userRolesData?.filter(role => role.user_id === profile.user_id) || [];
        
        // Create an entry for each role the user has
        for (const userRole of userRoles) {
          usersWithRoles.push({
            id: userRole.id,
            user_id: profile.user_id,
            email: profile.email,
            full_name: profile.full_name || profile.email,
            role: userRole.role,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          });
        }
      }

      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get users by specific role
  static async getUsersByRole(role: 'admin' | 'ops_manager' | 'deployment_engineer'): Promise<UserWithRole[]> {
    try {
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          user_id,
          profiles!inner(
            email,
            full_name,
            created_at,
            updated_at
          )
        `)
        .eq('role', role)
        .order('profiles.full_name');

      if (userRolesError) throw userRolesError;

      return (userRolesData || []).map(userRole => ({
        id: userRole.id,
        user_id: userRole.user_id,
        email: userRole.profiles.email,
        full_name: userRole.profiles.full_name || userRole.profiles.email,
        role: userRole.role,
        created_at: userRole.profiles.created_at,
        updated_at: userRole.profiles.updated_at
      }));
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
