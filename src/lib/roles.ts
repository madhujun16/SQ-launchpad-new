import { Shield, Users, Wrench } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['app_role'];

export interface RoleConfig {
  key: UserRole;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  permissions: string[];
  accessiblePages: string[];
  color: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  admin: {
    key: 'admin',
    displayName: 'Admin',
    icon: Shield,
    description: 'Create sites, assign Ops Managers and Deployment Engineers, manage site lifecycle',
    permissions: [
      'create_sites',
      'assign_users',
      'edit_site_assignments',
      'view_all_sites',
      'manage_users',
      'edit_site_info'
    ],
    accessiblePages: ['/dashboard', '/admin', '/site-study'],
    color: 'text-red-600'
  },
  ops_manager: {
    key: 'ops_manager',
    displayName: 'Ops Manager',
    icon: Users,
    description: 'Approve hardware requests and manage site approvals',
    permissions: [
      'approve_hardware_requests',
      'view_assigned_sites',
      'manage_approvals',
      'update_site_status'
    ],
    accessiblePages: ['/dashboard', '/ops-manager'],
    color: 'text-blue-600'
  },
  deployment_engineer: {
    key: 'deployment_engineer',
    displayName: 'Deployment Engineer',
    icon: Wrench,
    description: 'Conduct site studies, update site status, and manage deployment',
    permissions: [
      'conduct_site_studies',
      'upload_findings',
      'update_site_status',
      'view_assigned_sites',
      'add_site_geolocation'
    ],
    accessiblePages: ['/dashboard', '/deployment', '/site-study'],
    color: 'text-green-600'
  },
  user: {
    key: 'user',
    displayName: 'User',
    icon: Users,
    description: 'Basic user access',
    permissions: ['view_dashboard'],
    accessiblePages: ['/dashboard'],
    color: 'text-gray-600'
  }
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLES[role] || ROLES.user;
};

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const roleConfig = getRoleConfig(userRole);
  return roleConfig.permissions.includes(permission);
};

export const canAccessPage = (userRole: UserRole, pagePath: string): boolean => {
  const roleConfig = getRoleConfig(userRole);
  return roleConfig.accessiblePages.includes(pagePath);
};

export const getAccessiblePages = (userRole: UserRole): string[] => {
  const roleConfig = getRoleConfig(userRole);
  return roleConfig.accessiblePages;
}; 