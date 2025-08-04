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
    description: 'Create sites, assign Ops Managers and Deployment Engineers, scope hardware, manage approval workflows, export data',
    permissions: [
      'create_sites',
      'assign_users',
      'edit_site_assignments',
      'view_all_sites',
      'view_sites',
      'manage_users',
      'edit_site_info',
      'scope_hardware',
      'manage_approval_workflows',
      'manage_approvals',
      'export_data',
      'view_inventory',
      'view_forecast',
      'manage_licenses',
      'conduct_site_studies',
      'upload_findings',
      'update_site_status',
      'add_site_geolocation',
      'define_hardware_requirements'
    ],
    accessiblePages: [
      '/dashboard', 
      '/admin', 
      '/site-study', 
            '/hardware-scoping',
      '/hardware-approvals',
      '/hardware-master',
      '/control-desk', 
      '/forecast', 
      '/inventory', 
      '/license-management',
      '/site-creation',
      '/site'
    ],
    color: 'text-red-600'
  },
  ops_manager: {
    key: 'ops_manager',
    displayName: 'Ops Manager',
    icon: Users,
    description: 'Approve hardware requests for assigned sites, create sites, conduct site studies',
    permissions: [
      'approve_hardware_requests',
      'view_assigned_sites',
      'view_sites',
      'manage_approvals',
      'update_site_status',
      'view_inventory',
      'create_sites',
      'conduct_site_studies',
      'upload_findings',
      'add_site_geolocation',
      'define_hardware_requirements',
      'scope_hardware'
    ],
    accessiblePages: [
      '/dashboard', 
      '/inventory',
      '/site-study',
      '/site-creation',
      '/site',
      '/hardware-scoping',
      '/hardware-approvals',
      '/hardware-master'
    ],
    color: 'text-blue-600'
  },
  deployment_engineer: {
    key: 'deployment_engineer',
    displayName: 'Deployment Engineer',
    icon: Wrench,
    description: 'Conduct site studies, upload findings, define hardware requirements, update site status, create sites',
    permissions: [
      'conduct_site_studies',
      'upload_findings',
      'update_site_status',
      'view_assigned_sites',
      'view_sites',
      'manage_approvals',
      'add_site_geolocation',
      'define_hardware_requirements',
      'create_sites',
      'scope_hardware'
    ],
    accessiblePages: [
      '/dashboard', 
      '/site-study', 
      '/site-creation',
      '/site',
      '/hardware-scoping',
      '/hardware-approvals',
      '/hardware-master'
    ],
    color: 'text-green-600'
  }
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLES[role] || ROLES.admin; // Default to admin if role not found
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