// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface SiteWorkflowData {
  id: string;
  name: string;
  organization: string;
  organization_id: string;
  location: string;
  address: string;
  postcode: string;
  sector: string;
  unit_code: string;
  criticality_level: 'low' | 'medium' | 'high';
  status: string;
  target_live_date: string;
  assigned_ops_manager: string;
  assigned_deployment_engineer: string;
  latitude?: number;
  longitude?: number;
  siteCreation?: SiteCreationData;
  siteStudy?: SiteStudyData;
  scoping?: ScopingData;
  approval?: ApprovalData;
  procurement?: ProcurementData;
  deployment?: DeploymentData;
  goLive?: GoLiveData;
  created_at: string;
  updated_at: string;
}

export interface SiteCreationData {
  id: string;
  site_id: string;
  unit_manager_name: string;
  job_title: string;
  unit_manager_email: string;
  unit_manager_mobile: string;
  additional_contact_name: string;
  additional_contact_email: string;
  location: string;
  postcode: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  additional_notes: string;
  created_at: string;
  updated_at: string;
  locationInfo?: {
    location: string;
    postcode?: string;
    region?: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  contactInfo?: {
    unitManagerName: string;
    jobTitle: string;
    unitManagerEmail: string;
    unitManagerMobile: string;
    additionalContactName: string;
    additionalContactEmail: string;
  };
  additionalNotes?: string;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
}

export interface SiteStudyData {
  id: string;
  site_id: string;
  primary_contact_name: string;
  primary_contact_job_title: string;
  primary_contact_email: string;
  primary_contact_mobile: string;
  additional_contact_name: string;
  additional_contact_email: string;
  site_address: string;
  postcode: string;
  region: string;
  country: string;
  number_of_counters: number;
  floor_plan_available: boolean;
  meal_sessions: string[];
  floor: string;
  lift_access: string;
  security_restrictions: string;
  delivery_window: string;
  employee_strength: number;
  operating_hours: string;
  expected_footfall: number;
  peak_hours: string;
  seating_capacity: number;
  kitchen_staff: number;
  operating_days: string;
  service_staff: number;
  management: number;
  lan_points: number;
  ups_power_pos: string;
  wifi_available: string;
  ups_power_ceiling: string;
  bandwidth: string;
  static_ip: string;
  selected_solutions: string[];
  created_at: string;
  updated_at: string;
  space_type?: string;
  footfall_pattern?: string;
  peak_times?: string;
  constraints?: string[];
  layout_photos?: string[];
  mount_type?: string;
  surface_material?: string;
  drilling_required?: boolean;
  clearance_available?: string;
  distance_to_nearest?: string;
  accessible_height?: boolean;
  primary_purpose?: string;
  expected_transactions?: string;
  payment_methods?: string[];
  special_requirements?: string[];
  software_categories?: string[];
  category_requirements?: any;
  power_available?: boolean;
  network_available?: boolean;
  wifi_quality?: string;
  physical_constraints?: string[];
  study_date?: string;
  proposed_go_live?: string;
  urgency?: string;
  stakeholders?: string[];
  findings?: string;
  recommendations?: string;
  spaceAssessment?: any;
  requirements?: any;
  infrastructure?: any;
  timeline?: any;
}

export interface ScopingData {
  id: string;
  site_id: string;
  selected_software: string[];
  selected_hardware: Array<{ id: string; quantity: number; }>;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'changes_requested';
  submitted_at: string;
  approved_at: string;
  approved_by: string;
  cost_summary: {
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
  created_at: string;
  updated_at: string;
}

export interface ApprovalData {
  id: string;
  site_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  requested_at: string;
  approved_at: string;
  approved_by: string;
  comments: string;
  approver_details: { name: string; role: string; department: string; };
  created_at: string;
  updated_at: string;
}

export interface ProcurementData {
  id: string;
  site_id: string;
  status: 'pending' | 'ordered' | 'delivered' | 'partially_delivered';
  software_modules: Array<any>;
  hardware_items: Array<any>;
  summary: { totalSoftwareModules: number; totalHardwareItems: number; inProgress: number; completed: number; };
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentData {
  id: string;
  site_id: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  end_date: string;
  assigned_engineer: string;
  notes: string;
  progress: any;
  timeline: any;
  created_at: string;
  updated_at: string;
}

export interface GoLiveData {
  id: string;
  site_id: string;
  status: 'pending' | 'live' | 'postponed';
  date: string;
  signed_off_by: string;
  notes: string;
  checklist: any;
  timeline: any;
  created_at: string;
  updated_at: string;
}

export class SiteWorkflowService {
  static async getSiteWorkflowData(siteId: string): Promise<SiteWorkflowData | null> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getSoftwareModules(): Promise<any[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getHardwareItems(): Promise<any[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async saveSiteCreationData(siteId: string, data: Partial<SiteCreationData>): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async saveSiteStudyData(siteId: string, data: Partial<SiteStudyData>): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async saveScopingData(siteId: string, data: Partial<ScopingData>): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }
}
