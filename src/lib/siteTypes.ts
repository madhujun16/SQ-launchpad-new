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

// Unified status system - Finalized sequence
export type UnifiedSiteStatus = 
  | 'site_created' 
  | 'site_study_done' 
  | 'scoping_done' 
  | 'approved' 
  | 'procurement_done' 
  | 'deployed' 
  | 'live';

// Stepper step interface
export interface StepperStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ComponentType<{ className?: string }>;
}

// Map status to stepper step
export const getStepperStepFromStatus = (status: UnifiedSiteStatus): number => {
  const statusMap: Record<UnifiedSiteStatus, number> = {
    site_created: 0,
    site_study_done: 1,
    scoping_done: 2,
    approved: 3,
    procurement_done: 4,
    deployed: 5,
    live: 6
  };
  return statusMap[status] || 0;
};

// Create stepper steps based on site status
export const createStepperSteps = (currentStatus: UnifiedSiteStatus): StepperStep[] => {
  const currentStep = getStepperStepFromStatus(currentStatus);
  
  return [
    {
      id: 'site-created',
      title: 'Site Creation',
      description: 'Site has been created in the system',
      status: currentStep >= 0 ? (currentStep === 0 ? 'current' : 'completed') : 'upcoming',
      icon: Building
    },
    {
      id: 'site-study-done',
      title: 'Site Study',
      description: 'On-site assessment completed',
      status: currentStep >= 1 ? (currentStep === 1 ? 'current' : 'completed') : 'upcoming',
      icon: FileText
    },
    {
      id: 'scoping-done',
      title: 'Scoping',
      description: 'Software & Hardware scoping completed',
      status: currentStep >= 2 ? (currentStep === 2 ? 'current' : 'completed') : 'upcoming',
      icon: Package
    },
    {
      id: 'approved',
      title: 'Approval',
      description: 'Project approved by stakeholders',
      status: currentStep >= 3 ? (currentStep === 3 ? 'current' : 'completed') : 'upcoming',
      icon: CheckSquare
    },
    {
      id: 'procurement-done',
      title: 'Procurement',
      description: 'Hardware procurement completed',
      status: currentStep >= 4 ? (currentStep === 4 ? 'current' : 'completed') : 'upcoming',
      icon: Package
    },
    {
      id: 'deployed',
      title: 'Deployment',
      description: 'Hardware deployed and installed',
      status: currentStep >= 5 ? (currentStep === 5 ? 'current' : 'completed') : 'upcoming',
      icon: Truck
    },
    {
      id: 'live',
      title: 'Go-Live',
      description: 'Site is live and operational',
      status: currentStep >= 6 ? (currentStep === 6 ? 'current' : 'completed') : 'upcoming',
      icon: CheckCircle
    }
  ];
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'live':
      return 'bg-green-500';
    case 'deployed':
      return 'bg-green-600';
    case 'procurement_done':
      return 'bg-blue-500';
    case 'approved':
      return 'bg-purple-500';
    case 'scoping_done':
      return 'bg-indigo-500';
    case 'site_study_done':
      return 'bg-yellow-500';
    case 'site_created':
      return 'bg-gray-500';
    // Legacy status mappings for backward compatibility
    case 'created':
      return 'bg-gray-500';
    case 'study_completed':
      return 'bg-yellow-500';
    case 'hardware_scoped':
      return 'bg-indigo-500';
    case 'procurement':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusDisplayName = (status: string) => {
  switch (status) {
    // New finalized statuses
    case 'site_created':
      return 'Site Creation';
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
      return 'Go-Live';
    // Legacy status mappings for backward compatibility
    case 'created':
      return 'Site Created';
    case 'study_in_progress':
      return 'Site Study Done';
    case 'study_completed':
      return 'Site Study Done';
    case 'hardware_scoped':
      return 'Scoping Done';
    case 'procurement':
      return 'Procurement Done';
    case 'deployment':
      return 'Deployed';
    case 'activated':
      return 'Live';
    default:
      return status;
  }
};

// Workflow progression validation
export const getNextValidStatuses = (currentStatus: UnifiedSiteStatus): UnifiedSiteStatus[] => {
  switch (currentStatus) {
    case 'site_created':
      return ['site_study_done'];
    case 'site_study_done':
      return ['scoping_done'];
    case 'scoping_done':
      return ['approved'];
    case 'approved':
      return ['procurement_done'];
    case 'procurement_done':
      return ['deployed'];
    case 'deployed':
      return ['live'];
    case 'live':
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
  const statusOrder: UnifiedSiteStatus[] = ['site_created', 'site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live'];
  
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