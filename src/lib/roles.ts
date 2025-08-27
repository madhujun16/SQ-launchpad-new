import { Shield, Users, Wrench, User } from 'lucide-react';
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
      'define_hardware_requirements',
      'view_all_deployments',
      'view_all_assets',
      'manage_platform_configuration'
    ],
    accessiblePages: [
      '/dashboard', 
      '/sites',
      '/sites/create',
      '/sites/:id',
      '/sites/:id/study',
      '/approvals-procurement',
      '/approvals-procurement/hardware-approvals',
      '/approvals-procurement/hardware-scoping',
      '/approvals-procurement/hardware-master',
      '/deployment',
      '/assets',
      '/assets/inventory',
      '/assets/license-management',
      '/platform-configuration',
  
      // Note: Integrations and Forecast routes removed - not integrated into main navigation
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
      'scope_hardware',
      'view_assigned_deployments',
      'view_all_assets'
    ],
    accessiblePages: [
      '/dashboard', 
      '/sites',
      '/sites/create',
      '/sites/:id',
      '/sites/:id/study',
      '/approvals-procurement',
      '/approvals-procurement/hardware-approvals',
      '/approvals-procurement/hardware-scoping',
      '/approvals-procurement/hardware-master',
      '/deployment',
      '/assets',
      '/assets/inventory',
      '/assets/license-management',
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
      'manage_own_approvals',
      'add_site_geolocation',
      'define_hardware_requirements',
      'create_sites',
      'scope_hardware',
      'view_assigned_deployments',
      'view_assigned_assets'
    ],
    accessiblePages: [
      '/dashboard', 
      '/sites',
      '/sites/create',
      '/sites/:id',
      '/sites/:id/study',
      '/approvals-procurement',
      '/approvals-procurement/hardware-approvals',
      '/approvals-procurement/hardware-scoping',
      '/approvals-procurement/hardware-master',
      '/deployment',
      '/assets',
      '/assets/inventory',
      '/assets/license-management',
      '/site-study', 
      '/site-creation',
      '/site',
      '/hardware-scoping',
      '/hardware-approvals',
      '/hardware-master'
    ],
    color: 'text-green-600'
  },
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
  
  // Admin has access to everything
  if (userRole === 'admin') {
    return true;
  }
  
  // First check for exact matches
  if (roleConfig.accessiblePages.includes(pagePath)) {
    return true;
  }
  
  // Check for dynamic routes (routes with parameters like :id)
  for (const accessiblePage of roleConfig.accessiblePages) {
    if (accessiblePage.includes(':')) {
      // Convert the accessible page pattern to a regex
      const pattern = accessiblePage
        .replace(/:[^/]+/g, '[^/]+') // Replace :id with [^/]+
        .replace(/\//g, '\\/'); // Escape forward slashes
      
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(pagePath)) {
        return true;
      }
    }
  }
  
  // Check if the page path starts with any of the accessible pages (for nested routes)
  for (const accessiblePage of roleConfig.accessiblePages) {
    if (pagePath.startsWith(accessiblePage) && accessiblePage !== '/dashboard') {
      return true;
    }
  }
  
  // Legacy routes that should be accessible to all authenticated users
  const legacyRoutes = [
    '/site-study',
    '/site-creation', 
    '/hardware-approvals',
    '/hardware-scoping',
    '/hardware-master',
    '/inventory',
    '/license-management',
    '/admin',
    '/forecast',
    '/deployment'
  ];
  
  if (legacyRoutes.includes(pagePath)) {
    return true;
  }
  
  // Special case: allow access to common pages for all roles
  const commonPages = [
    '/dashboard',
    '/sites',
    '/approvals-procurement'
  ];
  
  if (commonPages.includes(pagePath)) {
    return true;
  }
  
  // No access found
  return false;
};

export const getAccessiblePages = (userRole: UserRole): string[] => {
  const roleConfig = getRoleConfig(userRole);
  return roleConfig.accessiblePages;
}; 