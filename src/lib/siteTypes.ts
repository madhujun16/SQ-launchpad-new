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
  location: SiteLocation;
  status: SiteStatus;
  overallStatus: 'new' | 'in-progress' | 'active' | 'deployed';
  assignment: SiteAssignment;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  description?: string;
  clientName: string; // Compass Group
  cafeteriaType: 'staff' | 'visitor' | 'mixed';
  capacity: number;
  expectedFootfall: number;
}

// Unified status system
export type UnifiedSiteStatus = 
  | 'created' 
  | 'study_in_progress' 
  | 'study_completed' 
  | 'hardware_scoped' 
  | 'approved' 
  | 'procurement' 
  | 'deployment' 
  | 'activated' 
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
    created: 0,
    study_in_progress: 1,
    study_completed: 1,
    hardware_scoped: 2,
    approved: 3,
    procurement: 3,
    deployment: 4,
    activated: 4,
    live: 4
  };
  return statusMap[status] || 0;
};

// Create stepper steps based on site status
export const createStepperSteps = (currentStatus: UnifiedSiteStatus): StepperStep[] => {
  const currentStep = getStepperStepFromStatus(currentStatus);
  
  return [
    {
      id: 'site-creation',
      title: 'Site Creation',
      description: 'Create new cafeteria sites',
      status: currentStep >= 0 ? (currentStep === 0 ? 'current' : 'completed') : 'upcoming',
      icon: Building
    },
    {
      id: 'site-study',
      title: 'Site Study',
      description: 'Conduct on-site assessment',
      status: currentStep >= 1 ? (currentStep === 1 ? 'current' : 'completed') : 'upcoming',
      icon: FileText
    },
    {
      id: 'scoping',
      title: 'Scoping',
      description: 'Software & Hardware selection',
      status: currentStep >= 2 ? (currentStep === 2 ? 'current' : 'completed') : 'upcoming',
      icon: Package
    },
    {
      id: 'approval',
      title: 'Approval',
      description: 'Ops Manager approval',
      status: currentStep >= 3 ? (currentStep === 3 ? 'current' : 'completed') : 'upcoming',
      icon: CheckSquare
    },
    {
      id: 'deployment',
      title: 'Deployment',
      description: 'Hardware installation',
      status: currentStep >= 4 ? (currentStep === 4 ? 'current' : 'completed') : 'upcoming',
      icon: Truck
    }
  ];
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'deployed':
    case 'completed':
    case 'live':
    case 'activated':
      return 'bg-green-500';
    case 'in-progress':
    case 'study_in_progress':
    case 'deployment':
    case 'procurement':
      return 'bg-blue-500';
    case 'active':
      return 'bg-green-600';
    case 'new':
    case 'pending':
    case 'created':
      return 'bg-gray-500';
    case 'hardware_scoped':
    case 'approved':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'deployed':
      return 'Deployed';
    case 'in-progress':
      return 'In Progress';
    case 'active':
      return 'Active';
    case 'new':
      return 'New';
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'created':
      return 'Created';
    case 'study_in_progress':
      return 'Study In Progress';
    case 'study_completed':
      return 'Study Completed';
    case 'hardware_scoped':
      return 'Hardware Scoped';
    case 'approved':
      return 'Approved';
    case 'procurement':
      return 'Procurement';
    case 'deployment':
      return 'Deployment';
    case 'activated':
      return 'Activated';
    case 'live':
      return 'Live';
    default:
      return status;
  }
}; 