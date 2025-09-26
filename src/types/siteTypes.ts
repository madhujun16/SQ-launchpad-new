// Shared Site interface and related types
export type UnifiedSiteStatus = 
  | 'Created'
  | 'site_study_done'
  | 'scoping_done'
  | 'approved'
  | 'procurement_done'
  | 'deployed'
  | 'live'
  | 'archived';

export interface Site {
  id: string;
  name: string;
  organization: string;
  foodCourt?: string;
  unitCode: string;
  sector: string;
  goLiveDate: string;
  priority: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  criticality: 'low' | 'medium' | 'high';
  status: UnifiedSiteStatus;
  assignedOpsManager?: string;
  assignedDeploymentEngineer?: string;
  stakeholders?: Stakeholder[];
  notes?: string;
  lastUpdated?: string;
  description?: string;
  
  // Site Creation data
  siteCreation?: {
    contactInfo: {
      unitManagerName: string;
      jobTitle: string;
      unitManagerEmail: string;
      unitManagerMobile: string;
      additionalContactName: string;
      additionalContactEmail: string;
    };
    locationInfo: {
      location: string;
      postcode: string;
      region: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    additionalNotes: string;
  };
  
  // Site Study data - Optional for backward compatibility
  siteStudy?: any;
  
  // Scoping data
  scoping?: {
    selectedSoftware: Array<{ id: string; quantity: number }>;
    selectedHardware: { id: string; quantity: number; customizations?: string }[];
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'changes_requested';
    submittedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    costSummary: {
      hardwareCost: number;
      softwareSetupCost: number;
      installationCost: number;
      contingencyCost: number;
      totalCapex: number;
      monthlySoftwareFees: number;
      maintenanceCost: number;
      totalMonthlyOpex: number;
      totalInvestment: number;
    };
  };
  
  // Approval data
  approval?: {
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    requestedAt?: string;
    approvedAt?: string;
    approvedBy?: string;
    comments?: string;
    approverDetails: {
      name: string;
      role: string;
      department: string;
    };
  };
  
  // Procurement data
  procurement?: {
    status: 'pending' | 'ordered' | 'delivered' | 'partially_delivered';
    lastUpdated?: string;
    softwareModules: {
      name: string;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      licenseKey?: string;
    }[];
    hardwareItems: {
      name: string;
      quantity: number;
      status: 'pending' | 'ordered' | 'delivered';
      orderDate?: string;
      deliveryDate?: string;
      trackingNumber?: string;
    }[];
    summary: {
      totalSoftwareModules: number;
      totalHardwareItems: number;
      inProgress: number;
      completed: number;
    };
  };
  
  // Deployment data
  deployment?: {
    status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
    startDate?: string;
    endDate?: string;
    assignedEngineer?: string;
    notes?: string;
    progress: {
      overallProgress: number;
      hardwareDelivered: 'completed' | 'in_progress' | 'pending';
      installation: 'completed' | 'in_progress' | 'pending';
      testing: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      hardwareDelivery: string;
      installationStart: string;
      installationEnd: string;
      testingStart: string;
      testingEnd: string;
      goLiveDate: string;
    };
  };
  
  // Go Live data
  goLive?: {
    status: 'pending' | 'live' | 'postponed';
    date?: string;
    signedOffBy?: string;
    notes?: string;
    checklist: {
      hardwareInstallationComplete: 'completed' | 'in_progress' | 'pending';
      softwareConfigurationComplete: 'completed' | 'in_progress' | 'pending';
      staffTraining: 'completed' | 'in_progress' | 'pending';
      finalTesting: 'completed' | 'in_progress' | 'pending';
    };
    timeline: {
      targetGoLiveDate: string;
      finalTesting: string;
      staffTraining: string;
      systemHandover: string;
    };
  };
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
}

export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category: string;
  monthlyFee: number;
  setupFee: number;
  hardwareRequirements: string[];
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  unitCost: number;
  category: string;
}
