import { useAuth } from './useAuth';
import { getRoleConfig, hasPermission } from '@/lib/roles';

export interface TabAccess {
  canAccess: boolean;
  accessLevel: 'full' | 'assigned' | 'own' | 'none';
  message?: string;
}

export const useRoleAccess = () => {
  const { currentRole, profile } = useAuth();

  const getTabAccess = (tabPath: string): TabAccess => {
    if (!currentRole) {
      return { canAccess: false, accessLevel: 'none', message: 'No role assigned' };
    }

    const roleConfig = getRoleConfig(currentRole);

    // Check for exact matches first
    switch (tabPath) {
      case '/dashboard':
        return { canAccess: true, accessLevel: 'full' };

      case '/sites':
      case '/sites/create':
      case '/sites/:id':
      case '/sites/:id/study':
        if (currentRole === 'admin') {
          return { canAccess: true, accessLevel: 'full' };
        } else if (['ops_manager', 'deployment_engineer'].includes(currentRole)) {
          return { canAccess: true, accessLevel: 'assigned', message: 'Viewing assigned sites only' };
        }
        return { canAccess: false, accessLevel: 'none', message: 'Access denied' };

      case '/approvals-procurement':
      case '/approvals-procurement/hardware-approvals':
      case '/approvals-procurement/hardware-scoping':
      case '/approvals-procurement/hardware-master':
        if (currentRole === 'admin') {
          return { canAccess: true, accessLevel: 'full' };
        } else if (currentRole === 'ops_manager') {
          return { canAccess: true, accessLevel: 'full', message: 'Full access to approvals' };
        } else if (currentRole === 'deployment_engineer') {
          return { canAccess: true, accessLevel: 'own', message: 'Viewing own submissions and related approvals only' };
        }
        return { canAccess: false, accessLevel: 'none', message: 'Access denied' };

      case '/deployment':
        if (currentRole === 'admin') {
          return { canAccess: true, accessLevel: 'full' };
        } else if (['ops_manager', 'deployment_engineer'].includes(currentRole)) {
          return { canAccess: true, accessLevel: 'assigned', message: 'Viewing assigned deployments only' };
        }
        return { canAccess: false, accessLevel: 'none', message: 'Access denied' };

      case '/assets':
      case '/assets/inventory':
      case '/assets/license-management':
        if (currentRole === 'admin') {
          return { canAccess: true, accessLevel: 'full' };
        } else if (currentRole === 'ops_manager') {
          return { canAccess: true, accessLevel: 'full', message: 'Full access to all assets' };
        } else if (currentRole === 'deployment_engineer') {
          return { canAccess: true, accessLevel: 'assigned', message: 'Viewing assigned site assets only' };
        }
        return { canAccess: false, accessLevel: 'none', message: 'Access denied' };

      case '/platform-configuration':
      case '/platform-configuration/admin':
      case '/admin':
        if (currentRole === 'admin') {
          return { canAccess: true, accessLevel: 'full' };
        }
        return { canAccess: false, accessLevel: 'none', message: 'Admin access required' };

      default:
        // Check if the path starts with any of the known tab paths
        if (tabPath.startsWith('/sites')) {
          if (currentRole === 'admin') {
            return { canAccess: true, accessLevel: 'full' };
          } else if (['ops_manager', 'deployment_engineer'].includes(currentRole)) {
            return { canAccess: true, accessLevel: 'assigned', message: 'Viewing assigned sites only' };
          }
        }
        
        if (tabPath.startsWith('/approvals-procurement')) {
          if (currentRole === 'admin') {
            return { canAccess: true, accessLevel: 'full' };
          } else if (currentRole === 'ops_manager') {
            return { canAccess: true, accessLevel: 'full', message: 'Full access to approvals' };
          } else if (currentRole === 'deployment_engineer') {
            return { canAccess: true, accessLevel: 'own', message: 'Viewing own submissions and related approvals only' };
          }
        }
        
        if (tabPath.startsWith('/assets')) {
          if (currentRole === 'admin') {
            return { canAccess: true, accessLevel: 'full' };
          } else if (currentRole === 'ops_manager') {
            return { canAccess: true, accessLevel: 'full', message: 'Full access to all assets' };
          } else if (currentRole === 'deployment_engineer') {
            return { canAccess: true, accessLevel: 'assigned', message: 'Viewing assigned site assets only' };
          }
        }
        
        if (tabPath.startsWith('/platform-configuration')) {
          if (currentRole === 'admin') {
            return { canAccess: true, accessLevel: 'full' };
          }
        }
        
        return { canAccess: false, accessLevel: 'none', message: 'Page not found' };
    }
  };

  const canAccessTab = (tabPath: string): boolean => {
    return getTabAccess(tabPath).canAccess;
  };

  const getTabAccessLevel = (tabPath: string): 'full' | 'assigned' | 'own' | 'none' => {
    return getTabAccess(tabPath).accessLevel;
  };

  const getTabAccessMessage = (tabPath: string): string | undefined => {
    return getTabAccess(tabPath).message;
  };

  return {
    currentRole,
    profile,
    getTabAccess,
    canAccessTab,
    getTabAccessLevel,
    getTabAccessMessage,
    roleConfig: currentRole ? getRoleConfig(currentRole) : null
  };
}; 