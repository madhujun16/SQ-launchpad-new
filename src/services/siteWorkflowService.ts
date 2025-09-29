import { supabase } from '@/integrations/supabase/client';

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
  
  // Workflow step data
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
}

export interface ScopingData {
  id: string;
  site_id: string;
  selected_software: string[];
  selected_hardware: Array<{
    id: string;
    quantity: number;
  }>;
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
  approver_details: {
    name: string;
    role: string;
    department: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProcurementData {
  id: string;
  site_id: string;
  status: 'pending' | 'ordered' | 'delivered' | 'partially_delivered';
  software_modules: Array<{
    name: string;
    status: 'pending' | 'ordered' | 'delivered';
    orderDate?: string;
    deliveryDate?: string;
    licenseKey?: string;
  }>;
  hardware_items: Array<{
    name: string;
    quantity: number;
    status: 'pending' | 'ordered' | 'delivered';
    orderDate?: string;
    deliveryDate?: string;
    trackingNumber?: string;
  }>;
  summary: {
    totalSoftwareModules: number;
    totalHardwareItems: number;
    inProgress: number;
    completed: number;
  };
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
  created_at: string;
  updated_at: string;
}

export class SiteWorkflowService {
  /**
   * Get complete site workflow data including all step data
   */
  static async getSiteWorkflowData(siteId: string): Promise<SiteWorkflowData | null> {
    try {
      console.log('🔍 Fetching complete site workflow data for:', siteId);

      // Get site basic data with organization and user assignments
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select(`
          *,
          organization:organizations(id, name, sector, unit_code),
          ops_manager:profiles!assigned_ops_manager(user_id, full_name, email),
          deployment_engineer:profiles!assigned_deployment_engineer(user_id, full_name, email)
        `)
        .eq('id', siteId)
        .eq('is_archived', false)
        .single();

      if (siteError) {
        console.error('❌ Error fetching site data:', siteError);
        return null;
      }

      if (!siteData) {
        console.log('⚠️ Site not found:', siteId);
        return null;
      }

      console.log('✅ Site data fetched:', {
        id: siteData.id,
        name: siteData.name,
        organization: siteData.organization?.name,
        status: siteData.status
      });

      // Get all workflow step data in parallel
      const [
        siteCreationResult,
        siteStudyResult,
        scopingResult,
        approvalResult,
        procurementResult,
        deploymentResult,
        goLiveResult
      ] = await Promise.all([
        supabase.from('site_creation_data').select('*').eq('site_id', siteId).single(),
        supabase.from('site_study_data').select('*').eq('site_id', siteId).single(),
        supabase.from('site_scoping_data').select('*').eq('site_id', siteId).single(),
        supabase.from('site_approvals').select('*').eq('site_id', siteId).single(),
        supabase.from('site_procurement').select('*').eq('site_id', siteId).single(),
        supabase.from('site_deployments').select('*').eq('site_id', siteId).single(),
        supabase.from('site_go_live').select('*').eq('site_id', siteId).single()
      ]);

      // Build the complete workflow data object
      const workflowData: SiteWorkflowData = {
        id: siteData.id,
        name: siteData.name,
        organization: siteData.organization?.name || 'Unknown Organization',
        organization_id: siteData.organization_id,
        location: siteData.location,
        address: siteData.address,
        postcode: siteData.postcode,
        sector: siteData.sector,
        unit_code: siteData.unit_code,
        criticality_level: siteData.criticality_level,
        status: siteData.status,
        target_live_date: siteData.target_live_date,
        assigned_ops_manager: siteData.ops_manager?.full_name || siteData.assigned_ops_manager,
        assigned_deployment_engineer: siteData.deployment_engineer?.full_name || siteData.assigned_deployment_engineer,
        latitude: siteData.latitude,
        longitude: siteData.longitude,
        created_at: siteData.created_at,
        updated_at: siteData.updated_at
      };

      // Add step data if it exists
      if (siteCreationResult.data) {
        workflowData.siteCreation = siteCreationResult.data;
        console.log('✅ Site creation data found');
      }

      if (siteStudyResult.data) {
        workflowData.siteStudy = siteStudyResult.data;
        console.log('✅ Site study data found');
      }

      if (scopingResult.data) {
        workflowData.scoping = scopingResult.data;
        console.log('✅ Scoping data found');
      }

      if (approvalResult.data) {
        workflowData.approval = approvalResult.data;
        console.log('✅ Approval data found');
      }

      if (procurementResult.data) {
        workflowData.procurement = procurementResult.data;
        console.log('✅ Procurement data found');
      }

      if (deploymentResult.data) {
        workflowData.deployment = deploymentResult.data;
        console.log('✅ Deployment data found');
      }

      if (goLiveResult.data) {
        workflowData.goLive = goLiveResult.data;
        console.log('✅ Go live data found');
      }

      console.log('✅ Complete workflow data assembled for site:', siteId);
      return workflowData;

    } catch (error) {
      console.error('❌ Error in getSiteWorkflowData:', error);
      return null;
    }
  }

  /**
   * Get software modules for scoping
   */
  static async getSoftwareModules(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('software_modules')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching software modules:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getSoftwareModules:', error);
      return [];
    }
  }

  /**
   * Get hardware items for scoping
   */
  static async getHardwareItems(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('hardware_items')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching hardware items:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getHardwareItems:', error);
      return [];
    }
  }

  /**
   * Save site creation data
   */
  static async saveSiteCreationData(siteId: string, data: Partial<SiteCreationData>): Promise<boolean> {
    try {
      const { assigned_ops_manager, assigned_deployment_engineer, ...siteCreationFields } = data;

      // Update the main sites table for assigned managers and location data
      const siteUpdateData: any = {
        updated_at: new Date().toISOString()
      };

      // Add assigned managers if provided
      if (assigned_ops_manager !== undefined) {
        siteUpdateData.assigned_ops_manager = assigned_ops_manager;
      }
      if (assigned_deployment_engineer !== undefined) {
        siteUpdateData.assigned_deployment_engineer = assigned_deployment_engineer;
      }

      // Add location data if provided
      if (siteCreationFields.locationInfo) {
        if (siteCreationFields.locationInfo.location) {
          siteUpdateData.address = siteCreationFields.locationInfo.location;
        }
        if (siteCreationFields.locationInfo.latitude !== undefined) {
          siteUpdateData.latitude = siteCreationFields.locationInfo.latitude;
        }
        if (siteCreationFields.locationInfo.longitude !== undefined) {
          siteUpdateData.longitude = siteCreationFields.locationInfo.longitude;
        }
      }

      // Only update if there's something to update
      if (Object.keys(siteUpdateData).length > 1) { // More than just updated_at
        const { error: siteUpdateError } = await supabase
          .from('sites')
          .update(siteUpdateData)
          .eq('id', siteId);

        if (siteUpdateError) {
          console.error('❌ Error updating site data:', siteUpdateError);
          return false;
        }
      }

      // Prepare the data for database insertion
      const dbData: any = {
        site_id: siteId,
        updated_at: new Date().toISOString()
      };

      // Map the data structure to database fields
      if (siteCreationFields.locationInfo) {
        dbData.location = siteCreationFields.locationInfo.location;
        dbData.postcode = siteCreationFields.locationInfo.postcode;
        dbData.region = siteCreationFields.locationInfo.region;
        dbData.country = siteCreationFields.locationInfo.country;
        dbData.latitude = siteCreationFields.locationInfo.latitude;
        dbData.longitude = siteCreationFields.locationInfo.longitude;
      }

      if (siteCreationFields.contactInfo) {
        dbData.unit_manager_name = siteCreationFields.contactInfo.unitManagerName;
        dbData.job_title = siteCreationFields.contactInfo.jobTitle;
        dbData.unit_manager_email = siteCreationFields.contactInfo.unitManagerEmail;
        dbData.unit_manager_mobile = siteCreationFields.contactInfo.unitManagerMobile;
        dbData.additional_contact_name = siteCreationFields.contactInfo.additionalContactName;
        dbData.additional_contact_email = siteCreationFields.contactInfo.additionalContactEmail;
      }

      if (siteCreationFields.additionalNotes) {
        dbData.additional_notes = siteCreationFields.additionalNotes;
      }

      const { error } = await supabase
        .from('site_creation_data')
        .upsert(dbData, {
          onConflict: 'site_id'
        });

      if (error) {
        console.error('❌ Error saving site creation data:', error);
        return false;
      }

      console.log('✅ Site creation data saved for site:', siteId);
      return true;
    } catch (error) {
      console.error('❌ Error in saveSiteCreationData:', error);
      return false;
    }
  }

  /**
   * Save site study data
   */
  static async saveSiteStudyData(siteId: string, data: Partial<SiteStudyData>): Promise<boolean> {
    try {
      // Prepare the data for database insertion
      const dbData: any = {
        site_id: siteId,
        updated_at: new Date().toISOString()
      };

      // Map the complex nested data structure to database fields
      if (data.spaceAssessment) {
        dbData.space_type = data.spaceAssessment.spaceType;
        dbData.footfall_pattern = data.spaceAssessment.footfallPattern;
        dbData.operating_hours = data.spaceAssessment.operatingHours;
        dbData.peak_times = data.spaceAssessment.peakTimes;
        dbData.constraints = data.spaceAssessment.constraints;
        dbData.layout_photos = data.spaceAssessment.layoutPhotos;
        
        if (data.spaceAssessment.mounting) {
          dbData.mount_type = data.spaceAssessment.mounting.mountType;
          dbData.surface_material = data.spaceAssessment.mounting.surfaceMaterial;
          dbData.drilling_required = data.spaceAssessment.mounting.drillingRequired;
          dbData.clearance_available = data.spaceAssessment.mounting.clearanceAvailable;
          dbData.distance_to_nearest = data.spaceAssessment.mounting.distanceToNearest;
          dbData.accessible_height = data.spaceAssessment.mounting.accessibleHeight;
        }
      }

      if (data.requirements) {
        dbData.primary_purpose = data.requirements.primaryPurpose;
        dbData.expected_transactions = data.requirements.expectedTransactions;
        dbData.payment_methods = data.requirements.paymentMethods;
        dbData.special_requirements = data.requirements.specialRequirements;
        dbData.software_categories = data.requirements.softwareCategories;
        dbData.category_requirements = data.requirements.categoryRequirements;
      }

      if (data.infrastructure) {
        dbData.power_available = data.infrastructure.powerAvailable;
        dbData.network_available = data.infrastructure.networkAvailable;
        dbData.wifi_quality = data.infrastructure.wifiQuality;
        dbData.physical_constraints = data.infrastructure.physicalConstraints;
      }

      if (data.timeline) {
        dbData.study_date = data.timeline.studyDate;
        dbData.proposed_go_live = data.timeline.proposedGoLive;
        dbData.urgency = data.timeline.urgency;
      }

      if (data.stakeholders) {
        dbData.stakeholders = data.stakeholders;
      }

      if (data.findings) {
        dbData.findings = data.findings;
      }

      if (data.recommendations) {
        dbData.recommendations = data.recommendations;
      }

      const { error } = await supabase
        .from('site_study_data')
        .upsert(dbData, {
          onConflict: 'site_id'
        });

      if (error) {
        console.error('❌ Error saving site study data:', error);
        return false;
      }

      console.log('✅ Site study data saved for site:', siteId);
      return true;
    } catch (error) {
      console.error('❌ Error in saveSiteStudyData:', error);
      return false;
    }
  }

  /**
   * Save scoping data
   */
  static async saveScopingData(siteId: string, data: Partial<ScopingData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_scoping_data')
        .upsert({
          site_id: siteId,
          ...data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'site_id'
        });

      if (error) {
        console.error('❌ Error saving scoping data:', error);
        return false;
      }

      console.log('✅ Scoping data saved for site:', siteId);
      return true;
    } catch (error) {
      console.error('❌ Error in saveScopingData:', error);
      return false;
    }
  }

  /**
   * Update site status
   */
  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (error) {
        console.error('❌ Error updating site status:', error);
        return false;
      }

      console.log('✅ Site status updated for site:', siteId, 'to:', status);
      return true;
    } catch (error) {
      console.error('❌ Error in updateSiteStatus:', error);
      return false;
    }
  }
}
