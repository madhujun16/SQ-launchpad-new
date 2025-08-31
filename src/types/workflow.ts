// Core Workflow Types for SmartQ Launchpad CG

export interface SiteWorkflowStatus {
  siteId: string;
  deploymentStage: DeploymentStage;
  approvalStatus: ApprovalStatus;
  assetStage: AssetStage;
  goLiveStatus: GoLiveStatus;
  lastUpdated: string;
  updatedBy: string;
}

export type DeploymentStage = 
  | 'Created'
  | 'study_in_progress'
  | 'study_completed'
  | 'hardware_scoped'
  | 'approval_pending'
  | 'approval_approved'
  | 'approval_rejected'
  | 'deployment_scheduled'
  | 'deployment_in_progress'
  | 'deployment_completed'
  | 'live_ready'
  | 'live';

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type AssetStage = 
  | 'not_required'
  | 'scoped'
  | 'ordered'
  | 'delivered'
  | 'installed'
  | 'activated';

export type GoLiveStatus = 
  | 'not_ready'
  | 'pending_activation'
  | 'live'
  | 'decommissioned';

export interface Site {
  id: string;
  name: string;
  type: string;
  location: string;
  goLiveDate?: string;
  status: string;
  createdBy: string;
  assignedTo?: string;
  workflowStatus: SiteWorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SiteStudy {
  id: string;
  siteId: string;
  findings: string;
  status: 'in_progress' | 'completed' | 'reviewed';
  uploadedDocs: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HardwareRequest {
  id: string;
  siteId: string;
  items: HardwareItem[];
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected';
  submittedBy: string;
  approvedBy?: string;
  comments: string[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface HardwareItem {
  id: string;
  type: 'pos_system' | 'kiosk' | 'printer' | 'networking' | 'server' | 'other';
  name: string;
  model: string;
  quantity: number;
  unitCost: number;
  specifications: string;
}

export interface Asset {
  id: string;
  type: string;
  serialNumber: string;
  siteId?: string;
  status: 'available' | 'deployed' | 'maintenance' | 'retired';
  licenseInfo?: LicenseInfo;
  warrantyInfo?: WarrantyInfo;
  serviceInfo?: ServiceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseInfo {
  licenseKey: string;
  type: 'hardware' | 'software' | 'service';
  status: 'active' | 'expired' | 'pending_renewal' | 'suspended';
  startDate: string;
  expiryDate?: string;
  renewalDate?: string;
  cost: number;
  vendor: string;
}

export interface WarrantyInfo {
  warrantyType: string;
  startDate: string;
  endDate: string;
  terms: string;
  provider: string;
}

export interface ServiceInfo {
  serviceType: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceProvider: string;
  contractNumber?: string;
}

export interface Deployment {
  id: string;
  siteId: string;
  scheduleDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  checklist: DeploymentChecklistItem[];
  activatedBy?: string;
  activationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentChecklistItem {
  id: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'site' | 'study' | 'hardware_request' | 'asset' | 'deployment';
  entityId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface Alert {
  id: string;
  type: 'license_expiry' | 'warranty_expiry' | 'service_due' | 'deployment_delay' | 'approval_overdue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  assignedTo?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface TaskQueue {
  id: string;
  title: string;
  description: string;
  type: 'approval' | 'study' | 'deployment' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  dueDate: string;
  siteId?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

// Role-based access control types
export type UserRole = 'admin' | 'ops_manager' | 'deployment_engineer';

export interface RolePermissions {
  canViewAllSites: boolean;
  canCreateSites: boolean;
  canConductStudies: boolean;
  canApproveHardware: boolean;
  canManageDeployments: boolean;
  canViewAllAssets: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllSites: true,
    canCreateSites: true,
    canConductStudies: false,
    canApproveHardware: true,
    canManageDeployments: true,
    canViewAllAssets: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
  ops_manager: {
    canViewAllSites: false,
    canCreateSites: true,
    canConductStudies: true,
    canApproveHardware: true,
    canManageDeployments: false,
    canViewAllAssets: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  deployment_engineer: {
    canViewAllSites: false,
    canCreateSites: false,
    canConductStudies: true,
    canApproveHardware: false,
    canManageDeployments: true,
    canViewAllAssets: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
};

// Workflow stage utilities
export const getWorkflowStageLabel = (stage: DeploymentStage): string => {
  const labels: Record<DeploymentStage, string> = {
    Created: 'Created',
    study_in_progress: 'Study In Progress',
    study_completed: 'Study Completed',
    hardware_scoped: 'Hardware Scoped',
    approval_pending: 'Approval Pending',
    approval_approved: 'Approved',
    approval_rejected: 'Rejected',
    deployment_scheduled: 'Deployment Scheduled',
    deployment_in_progress: 'Deployment In Progress',
    deployment_completed: 'Deployment Completed',
    live_ready: 'Ready for Go-Live',
    live: 'Live',
  };
  return labels[stage];
};

export const getWorkflowStageColor = (stage: DeploymentStage): string => {
  const colors: Record<DeploymentStage, string> = {
    Created: 'bg-blue-100 text-blue-800',
    study_in_progress: 'bg-yellow-100 text-yellow-800',
    study_completed: 'bg-green-100 text-green-800',
    hardware_scoped: 'bg-purple-100 text-purple-800',
    approval_pending: 'bg-orange-100 text-orange-800',
    approval_approved: 'bg-green-100 text-green-800',
    approval_rejected: 'bg-red-100 text-red-800',
    deployment_scheduled: 'bg-blue-100 text-blue-800',
    deployment_in_progress: 'bg-yellow-100 text-yellow-800',
    deployment_completed: 'bg-green-100 text-green-800',
    live_ready: 'bg-green-100 text-green-800',
    live: 'bg-green-100 text-green-800',
  };
  return colors[stage];
}; 