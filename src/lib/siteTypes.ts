export interface SiteLocation {
  latitude?: number;
  longitude?: number;
  address: string;
  city: string;
  postcode: string;
}

export interface SiteAssignment {
  opsManagerId: string;
  deploymentEngineerId: string;
  assignedAt: string;
  assignedBy: string;
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

export const getOverallStatus = (status: SiteStatus): 'new' | 'in-progress' | 'active' | 'deployed' => {
  const allCompleted = Object.values(status).every(s => s === 'completed');
  const anyInProgress = Object.values(status).some(s => s === 'in-progress');
  const anyCompleted = Object.values(status).some(s => s === 'completed');
  
  if (allCompleted) return 'deployed';
  if (anyInProgress || anyCompleted) return 'in-progress';
  return 'new';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'deployed':
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'active':
      return 'bg-green-600';
    case 'new':
    case 'pending':
      return 'bg-gray-500';
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
    default:
      return status;
  }
}; 