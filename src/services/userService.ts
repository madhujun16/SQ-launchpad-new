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
      // Use the same approach as PlatformConfiguration - load profiles first, then roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, created_at, updated_at')
        .order('full_name');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return [];
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('No profiles found');
        return [];
      }

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.user_id);
            
            // Create an entry for each role the user has
            const userRoles: UserWithRole[] = [];
            if (rolesData && rolesData.length > 0) {
              for (const roleData of rolesData) {
                userRoles.push({
                  id: profile.id,
                  user_id: profile.user_id,
                  email: profile.email,
                  full_name: profile.full_name || profile.email,
                  role: roleData.role,
                  created_at: profile.created_at,
                  updated_at: profile.updated_at
                });
              }
            }
            return userRoles;
          } catch (roleError) {
            console.error('Error fetching roles for user:', profile.email, roleError);
            return [];
          }
        })
      );

      // Flatten the array of arrays
      return usersWithRoles.flat();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Get users by specific role
  static async getUsersByRole(role: 'admin' | 'ops_manager' | 'deployment_engineer'): Promise<UserWithRole[]> {
    try {
      // Use the same approach as PlatformConfiguration - load profiles first, then roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, created_at, updated_at')
        .order('full_name');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return [];
      }

      if (!profilesData || profilesData.length === 0) {
        return [];
      }

      // Filter users by role
      const usersWithRole = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.user_id)
              .eq('role', role);
            
            if (rolesData && rolesData.length > 0) {
              return {
                id: profile.id,
                user_id: profile.user_id,
                email: profile.email,
                full_name: profile.full_name || profile.email,
                role: role,
                created_at: profile.created_at,
                updated_at: profile.updated_at
              };
            }
            return null;
          } catch (roleError) {
            console.error('Error fetching roles for user:', profile.email, roleError);
            return null;
          }
        })
      );

      return usersWithRole.filter(user => user !== null) as UserWithRole[];
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
