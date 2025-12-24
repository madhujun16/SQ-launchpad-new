import { Building, FileText, Package, CheckSquare, Truck, CheckCircle } from 'lucide-react';

export interface SiteLocation {
  address: string;
  city: string;
  postcode: string;
  region: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SiteAssignment {
  opsManager: string;
  deploymentEngineer: string;
  assignedBy: string;
  assignedAt: string;
}

export interface SiteStatus {
  study: 'pending' | 'in-progress' | 'completed';
  costApproval: 'pending' | 'in-progress' | 'completed';
  inventory: 'pending' | 'in-progress' | 'completed';
  products: 'pending' | 'in-progress' | 'completed';
  deployment: 'pending' | 'in-progress' | 'completed';
}

export interface Site {
  id: string;
  name: string;
  organization: string;
  foodCourt: string;
  unitCode: string;
  sector?: string; // Optional sector property
  goLiveDate: string;
  originalTargetDate?: string; // Original target date from Create Site step
  priority: 'low' | 'medium' | 'high' | 'urgent';
  riskLevel: 'low' | 'medium' | 'high';
  criticality?: 'low' | 'medium' | 'high';
  status: UnifiedSiteStatus;
  assignedOpsManager: string;
  assignedDeploymentEngineer: string;
  stakeholders: any[];
  notes?: string;
  description?: string;
  lastUpdated: string;
  hardwareScope?: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };
  // Legacy properties for backward compatibility
  location?: SiteLocation;
  overallStatus?: 'new' | 'in-progress' | 'active' | 'deployed';
  assignment?: SiteAssignment;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  clientName?: string;
  cafeteriaType?: 'staff' | 'visitor' | 'mixed';
  capacity?: number;
  expectedFootfall?: number;
}

// Unified status system - Uses page names to reflect current in-progress step
export type UnifiedSiteStatus = 
  | 'Created'
  | 'create_site'  // Page name for Create Site
  | 'site_study'   // Page name for Site Study (current in-progress)
  | 'site_study_done'  // Legacy support
  | 'scoping'      // Page name for Scoping (current in-progress)
  | 'scoping_done' // Legacy support
  | 'approval'     // Page name for Approval (current in-progress)
  | 'approved'     // Legacy support
  | 'procurement'  // Page name for Procurement (current in-progress)
  | 'procurement_done' // Legacy support
  | 'deployment'   // Page name for Deployment (current in-progress)
  | 'deployed'     // Legacy support
  | 'go_live'      // Page name for Go Live (current in-progress)
  | 'live'         // Legacy support
  | 'archived';

// Stepper step interface - Updated to match EnhancedStepperStep
export interface StepperStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ComponentType<{ className?: string }>;
  isExpanded?: boolean;
  canCollapse?: boolean;
  readOnly?: boolean;
}

// Map status to stepper step
// Status now uses page names (e.g., 'site_study', 'scoping') instead of 'done' statuses
export const getStepperStepFromStatus = (status: UnifiedSiteStatus): number => {
  const statusMap: Record<UnifiedSiteStatus, number> = {
  Created: 0,
  create_site: 0,
  site_study: 1,
  site_study_done: 1, // Legacy support
  scoping: 2,
  scoping_done: 2, // Legacy support
  approval: 3,
  approved: 3, // Legacy support
  procurement: 4,
  procurement_done: 4, // Legacy support
  deployment: 5,
  deployed: 5, // Legacy support
  go_live: 6,
  live: 6, // Legacy support
  archived: 7
};
  return statusMap[status] || 0;
};

// Create stepper steps based on site status
export const createStepperSteps = (currentStatus: UnifiedSiteStatus): StepperStep[] => {
  const currentStep = getStepperStepFromStatus(currentStatus);
  
  return [
    {
      id: 'site-created',
      title: 'Create Site',
      description: 'Initialize new site in the system',
      status: currentStep >= 0 ? (currentStep === 0 ? 'current' : 'completed') : 'upcoming',
      icon: Building,
      isExpanded: currentStep === 0,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'site-study-done',
      title: 'Site Study',
      description: 'Perform on-site assessment and analysis',
      status: currentStep >= 1 ? (currentStep === 1 ? 'current' : 'completed') : 'upcoming',
      icon: FileText,
      isExpanded: currentStep === 1,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'scoping-done',
      title: 'Define Scope',
      description: 'Determine software & hardware requirements',
      status: currentStep >= 2 ? (currentStep === 2 ? 'current' : 'completed') : 'upcoming',
      icon: Package,
      isExpanded: currentStep === 2,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'approved',
      title: 'Approval',
      description: 'Obtain stakeholder approval for project',
      status: currentStep >= 3 ? (currentStep === 3 ? 'current' : 'completed') : 'upcoming',
      icon: CheckSquare,
      isExpanded: currentStep === 3,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'procurement-done',
      title: 'Procurement',
      description: 'Source and acquire required hardware',
      status: currentStep >= 4 ? (currentStep === 4 ? 'current' : 'completed') : 'upcoming',
      icon: Package,
      isExpanded: currentStep === 4,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'deployed',
      title: 'Deployment',
      description: 'Install and configure hardware on-site',
      status: currentStep >= 5 ? (currentStep === 5 ? 'current' : 'completed') : 'upcoming',
      icon: Truck,
      isExpanded: currentStep === 5,
      canCollapse: true,
      readOnly: false
    },
    {
      id: 'live',
      title: 'Go Live',
      description: 'Activate site and begin operations',
      status: currentStep >= 6 ? (currentStep === 6 ? 'current' : 'completed') : 'upcoming',
      icon: CheckCircle,
      isExpanded: currentStep === 6,
      canCollapse: true,
      readOnly: false
    }
  ];
};

export const getStatusColor = (status: string) => {
  switch (status) {
    // Green: Live
    case 'live':
      return 'bg-green-100 text-green-800';
    
    // Gray: Created, Pending
    case 'Created':
    case 'created':
    case 'site_created':
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    
    // Yellow: In Progress
    case 'in_progress':
    case 'site_study_done':
    case 'study_completed':
      return 'bg-yellow-100 text-yellow-800';
    
    // Red: Blocked, On Hold, Rejected
    case 'blocked':
    case 'on_hold':
    case 'rejected':
      return 'bg-red-100 text-red-800';
    
    // Blue: Procurement Done, Deployed, Approved
    case 'procurement_done':
    case 'procurement':
    case 'deployed':
    case 'approved':
    case 'scoping_done':
    case 'hardware_scoped':
      return 'bg-green-100 text-green-800';
    
    // Default gray for unknown statuses
    case 'archived':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusDisplayName = (status: string) => {
  switch (status) {
    // Page names (current in-progress steps)
    case 'Created':
    case 'site_created':
    case 'create_site':
      return 'Create Site';
    case 'site_study':
      return 'Site Study';
    case 'scoping':
      return 'Scoping';
    case 'approval':
      return 'Approval';
    case 'procurement':
      return 'Procurement';
    case 'deployment':
      return 'Deployment';
    case 'go_live':
      return 'Go Live';
    // Legacy "done" statuses (for backward compatibility)
    case 'site_study_done':
      return 'Site Study';
    case 'scoping_done':
      return 'Scoping';
    case 'approved':
      return 'Approval';
    case 'procurement_done':
      return 'Procurement';
    case 'deployed':
      return 'Deployment';
    case 'live':
      return 'Go Live';
    case 'archived':
      return 'Archived';
    // Legacy status mappings for backward compatibility
    case 'created':
      return 'Create Site';
    case 'study_in_progress':
      return 'Site Study';
    case 'study_completed':
      return 'Site Study';
    case 'hardware_scoped':
      return 'Scoping';
    default:
      // Capitalize page names for display
      return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
};

// Workflow progression validation
export const getNextValidStatuses = (currentStatus: UnifiedSiteStatus): UnifiedSiteStatus[] => {
  switch (currentStatus) {
    case 'Created':
    case 'create_site':
      return ['site_study'];
    case 'site_study':
    case 'site_study_done': // Legacy support
      return ['scoping'];
    case 'scoping':
    case 'scoping_done': // Legacy support
      return ['approval'];
    case 'approval':
    case 'approved': // Legacy support
      return ['procurement'];
    case 'procurement':
    case 'procurement_done': // Legacy support
      return ['deployment'];
    case 'deployment':
    case 'deployed': // Legacy support
      return ['go_live'];
    case 'go_live':
    case 'live': // Legacy support
      return []; // Final status
    default:
      return [];
  }
};

export const canProgressToStatus = (currentStatus: UnifiedSiteStatus, targetStatus: UnifiedSiteStatus, isAdmin: boolean = false): boolean => {
  // Admin can override progression rules
  if (isAdmin) return true;
  
  const validNextStatuses = getNextValidStatuses(currentStatus);
  return validNextStatuses.includes(targetStatus);
};

export const validateStatusProgression = (currentStatus: UnifiedSiteStatus, targetStatus: UnifiedSiteStatus): { valid: boolean; message?: string } => {
  // Status order using page names (current in-progress steps)
  const statusOrder: UnifiedSiteStatus[] = ['Created', 'site_study', 'scoping', 'approval', 'procurement', 'deployment', 'go_live'];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);
  
  if (currentIndex === -1 || targetIndex === -1) {
    return { valid: false, message: 'Invalid status provided' };
  }
  
  if (targetIndex <= currentIndex) {
    return { valid: false, message: 'Cannot move backwards in workflow progression' };
  }
  
  if (targetIndex > currentIndex + 1) {
    return { valid: false, message: `Cannot skip steps. Next valid status is: ${getStatusDisplayName(statusOrder[currentIndex + 1])}` };
  }
  
  return { valid: true };
}; 