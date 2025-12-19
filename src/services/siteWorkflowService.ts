import { SitesService, type Site as BackendSite } from './sitesService';
import PageService from './pageService';

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
    try {
      const allSites = await SitesService.getAllSites();
      const site = allSites.find((s: BackendSite) => s.id === siteId);
      if (!site) {
        console.warn('getSiteWorkflowData: site not found for id', siteId);
        return null;
      }

      const workflow: SiteWorkflowData = {
        id: site.id,
        name: site.name,
        organization: site.organization_name || (site as any).organization || '',
        organization_id: site.organization_id || '',
        location: site.location || '',
        address: site.location || '',
        postcode: (site as any).postcode || '',
        sector: site.recorded_sector || site.sector || '',
        unit_code: site.unit_code || '',
        criticality_level: (site.criticality_level || 'medium') as any,
        status: site.status,
        target_live_date: site.target_live_date || '',
        assigned_ops_manager: site.assigned_ops_manager || '',
        assigned_deployment_engineer: site.assigned_deployment_engineer || '',
        latitude: (site as any).latitude,
        longitude: (site as any).longitude,
        created_at: site.created_at,
        updated_at: site.updated_at,
      };

      // Enrich with data from the "site_study" page, general_info section
      try {
        const page = await PageService.getPage('site_study', site.id);
        const general = page?.sections?.find((s) => s.section_name === 'general_info');
        if (general && general.fields) {
          const byName = (fieldName: string) =>
            general.fields!.find((f: any) => f.field_name === fieldName)?.field_value;

          const loc = byName('location');
          const postcode = byName('postcode') ?? workflow.postcode;
          const region = byName('region');
          const country = byName('country');
          const lat = byName('latitude') ?? workflow.latitude;
          const lng = byName('longitude') ?? workflow.longitude;

          workflow.siteCreation = {
            id: String(page.page_id ?? ''),
            site_id: site.id,
            unit_manager_name: '',
            job_title: '',
            unit_manager_email: '',
            unit_manager_mobile: '',
            additional_contact_name: '',
            additional_contact_email: '',
            location: typeof loc === 'string' ? loc : '',
            postcode: typeof postcode === 'string' ? postcode : '',
            region: typeof region === 'string' ? region : '',
            country: typeof country === 'string' ? country : '',
            latitude: Number(lat) || 0,
            longitude: Number(lng) || 0,
            additional_notes: '',
            created_at: workflow.created_at,
            updated_at: workflow.updated_at,
            locationInfo: {
              location: typeof loc === 'string' ? loc : '',
              postcode: typeof postcode === 'string' ? postcode : '',
              region: typeof region === 'string' ? region : '',
              country: typeof country === 'string' ? country : '',
              latitude: Number(lat) || 0,
              longitude: Number(lng) || 0,
            },
            contactInfo: {
              unitManagerName: '',
              jobTitle: '',
              unitManagerEmail: '',
              unitManagerMobile: '',
              additionalContactName: '',
              additionalContactEmail: '',
            },
            assigned_ops_manager: workflow.assigned_ops_manager,
            assigned_deployment_engineer: workflow.assigned_deployment_engineer,
          };
        }
      } catch (pageErr) {
        console.warn('getSiteWorkflowData: unable to load site_study page', pageErr);
      }

      return workflow;
    } catch (error) {
      console.error('getSiteWorkflowData error:', error);
      return null;
    }
  }

  static async getSoftwareModules(): Promise<any[]> {
    console.warn('getSoftwareModules is not yet implemented; returning empty array');
    return [];
  }

  static async getHardwareItems(): Promise<any[]> {
    console.warn('getHardwareItems is yet to be implemented; returning empty array');
    return [];
  }

  static async saveSiteCreationData(siteId: string, data: Partial<SiteCreationData>): Promise<boolean> {
    try {
      const pageName = 'site_study';
      const sectionName = 'general_info';

      if (data.locationInfo) {
        const { location, postcode, region, country, latitude, longitude } = data.locationInfo;
        if (location) {
          await PageService.updateField(siteId, pageName, sectionName, 'location', location);
        }
        if (postcode) {
          await PageService.updateField(siteId, pageName, sectionName, 'postcode', postcode);
        }
        if (region) {
          await PageService.updateField(siteId, pageName, sectionName, 'region', region);
        }
        if (country) {
          await PageService.updateField(siteId, pageName, sectionName, 'country', country);
        }
        if (typeof latitude === 'number') {
          await PageService.updateField(siteId, pageName, sectionName, 'latitude', latitude);
        }
        if (typeof longitude === 'number') {
          await PageService.updateField(siteId, pageName, sectionName, 'longitude', longitude);
        }
      }

      if (data.assigned_ops_manager) {
        await PageService.updateField(
          siteId,
          pageName,
          sectionName,
          'assigned_ops_manager',
          data.assigned_ops_manager
        );
      }
      if (data.assigned_deployment_engineer) {
        await PageService.updateField(
          siteId,
          pageName,
          sectionName,
          'assigned_deployment_engineer',
          data.assigned_deployment_engineer
        );
      }

      return true;
    } catch (error) {
      console.error('saveSiteCreationData error:', error);
      return false;
    }
  }

  static async saveSiteStudyData(siteId: string, data: Partial<SiteStudyData>): Promise<boolean> {
    console.warn('saveSiteStudyData not fully implemented; no-op for now', {
      siteId,
      data,
    });
    return true;
  }

  static async saveScopingData(siteId: string, data: Partial<ScopingData>): Promise<boolean> {
    console.warn('saveScopingData not fully implemented; no-op for now', {
      siteId,
      data,
    });
    return true;
  }

  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    try {
      const ok = await SitesService.updateSite(siteId, { status } as Partial<BackendSite>);
      if (!ok) {
        console.error('updateSiteStatus: SitesService.updateSite returned false');
      }
      return ok;
    } catch (error) {
      console.error('updateSiteStatus error:', error);
      return false;
    }
  }
}
