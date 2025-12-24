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
      console.log('🔍 SiteWorkflowService.getSiteWorkflowData: Fetching data for site:', siteId);
      // Use cache to avoid duplicate getAllSites calls
      const allSites = await SitesService.getAllSites(true);
      const site = allSites.find((s: BackendSite) => s.id === siteId);
      if (!site) {
        console.warn('❌ SiteWorkflowService.getSiteWorkflowData: site not found for id', siteId);
        return null;
      }

      console.log('🔍 SiteWorkflowService.getSiteWorkflowData: Found site:', {
        id: site.id,
        name: site.name,
        organization_name: site.organization_name,
        target_live_date: site.target_live_date,
        assigned_ops_manager: site.assigned_ops_manager,
        assigned_deployment_engineer: site.assigned_deployment_engineer,
        sector: site.sector,
        unit_code: site.unit_code
      });

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

      // Enrich with data from the "create_site" page, general_info section (FIRST page in workflow)
      // Backend GET /api/site/all already normalizes these fields, but we read from page for detail view
      // to get the full page structure and any additional fields not normalized
      try {
        console.log('🔍 SiteWorkflowService.getSiteWorkflowData: Attempting to load create_site page for site:', site.id);
        const createSitePage = await PageService.getPage('create_site', site.id);
        
        if (!createSitePage) {
          console.warn('⚠️ SiteWorkflowService.getSiteWorkflowData: create_site page not found for site:', site.id);
        } else {
          console.log('🔍 SiteWorkflowService.getSiteWorkflowData: create_site page result:', {
            hasPage: !!createSitePage,
            pageId: createSitePage?.page_id,
            sectionsCount: createSitePage?.sections?.length,
            sections: createSitePage?.sections?.map(s => ({ name: s.section_name, fieldsCount: s.fields?.length }))
          });
          
          const generalInfo = createSitePage?.sections?.find((s) => s.section_name === 'general_info');
          const locationInfo = createSitePage?.sections?.find((s) => s.section_name === 'location_info');
          
          console.log('🔍 SiteWorkflowService.getSiteWorkflowData: general_info section:', {
            found: !!generalInfo,
            fieldsCount: generalInfo?.fields?.length,
            fieldNames: generalInfo?.fields?.map((f: any) => f.field_name)
          });
          
          console.log('🔍 SiteWorkflowService.getSiteWorkflowData: location_info section:', {
            found: !!locationInfo,
            fieldsCount: locationInfo?.fields?.length,
            fieldNames: locationInfo?.fields?.map((f: any) => f.field_name)
          });
          
          if (generalInfo && generalInfo.fields) {
            const byName = (fieldName: string) => {
              const field = generalInfo.fields!.find((f: any) => f.field_name === fieldName);
              if (!field) return null;
              const value = field.field_value;
              // Backend supports: {value: "..."}, {text: "..."}, {label: "..."}, or plain string
              if (typeof value === 'object' && value !== null) {
                if ('value' in value) return value.value;
                if ('text' in value) return value.text;
                if ('label' in value) return value.label;
                return value; // Return object as-is if no recognized key
              }
              return value; // Plain string
            };

            // Extract organization, site name, etc. from general_info
            // Backend already normalized these in getAllSites, but we use page data for detail view
            const orgName = byName('org_name');
            const siteName = byName('site_name');
            const unitId = byName('unit_id');
            const targetLiveDate = byName('target_live_date');
            const suggestedGoLive = byName('suggested_go_live');
            const assignedOpsManager = byName('assigned_ops_manager');
            const assignedDeploymentEngineer = byName('assigned_deployment_engineer');
            const sector = byName('sector');

            // Update workflow with data from create_site/general_info
            // Prefer page data as it's the source of truth
            if (orgName) workflow.organization = String(orgName);
            if (siteName) workflow.name = String(siteName);
            if (unitId) workflow.unit_code = String(unitId);
            if (targetLiveDate) workflow.target_live_date = String(targetLiveDate);
            if (suggestedGoLive) workflow.suggested_go_live = String(suggestedGoLive);
            if (assignedOpsManager) workflow.assigned_ops_manager = String(assignedOpsManager);
            if (assignedDeploymentEngineer) workflow.assigned_deployment_engineer = String(assignedDeploymentEngineer);
            if (sector) workflow.sector = String(sector);
            
            console.log('✅ SiteWorkflowService.getSiteWorkflowData: Updated workflow from create_site/general_info:', {
              organization: workflow.organization,
              name: workflow.name,
              unit_code: workflow.unit_code,
              target_live_date: workflow.target_live_date,
              assigned_ops_manager: workflow.assigned_ops_manager,
              assigned_deployment_engineer: workflow.assigned_deployment_engineer,
              sector: workflow.sector
            });
          }
        }

        // Extract location data from location_info section
        if (locationInfo && locationInfo.fields) {
          const byName = (fieldName: string) => {
            const field = locationInfo.fields!.find((f: any) => f.field_name === fieldName);
            if (!field) return null;
            const value = field.field_value;
            // Backend supports: {value: "..."}, {text: "..."}, {label: "..."}, or plain string
            if (typeof value === 'object' && value !== null) {
              if ('value' in value) return value.value;
              if ('text' in value) return value.text;
              if ('label' in value) return value.label;
              return value;
            }
            return value;
          };

          const loc = byName('location');
          const postcode = byName('postcode') ?? workflow.postcode;
          const region = byName('region');
          const country = byName('country');
          const lat = byName('latitude') ?? workflow.latitude;
          const lng = byName('longitude') ?? workflow.longitude;

          workflow.siteCreation = {
            id: String(createSitePage?.page_id ?? ''),
            site_id: site.id,
            unit_manager_name: '',
            job_title: '',
            unit_manager_email: '',
            unit_manager_mobile: '',
            additional_contact_name: '',
            additional_contact_email: '',
            location: typeof loc === 'string' ? loc : workflow.location || '',
            postcode: typeof postcode === 'string' ? postcode : workflow.postcode || '',
            region: typeof region === 'string' ? region : '',
            country: typeof country === 'string' ? country : 'United Kingdom',
            latitude: Number(lat) || workflow.latitude || 0,
            longitude: Number(lng) || workflow.longitude || 0,
            additional_notes: '',
            created_at: workflow.created_at,
            updated_at: workflow.updated_at,
            locationInfo: {
              location: typeof loc === 'string' ? loc : workflow.location || '',
              postcode: typeof postcode === 'string' ? postcode : workflow.postcode || '',
              region: typeof region === 'string' ? region : '',
              country: typeof country === 'string' ? country : 'United Kingdom',
              latitude: Number(lat) || workflow.latitude || 0,
              longitude: Number(lng) || workflow.longitude || 0,
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
        console.warn('getSiteWorkflowData: unable to load create_site page', pageErr);
      }

      // Load site_study page data
      try {
        const siteStudyPage = await PageService.getPage('site_study', site.id);
        
        if (siteStudyPage && siteStudyPage.sections) {
          const parseFieldValue = (value: any): any => {
            if (typeof value === 'string') {
              // Try to parse as JSON, fallback to string
              try {
                return JSON.parse(value);
              } catch {
                return value;
              }
            }
            // Handle object format {value: "..."} or plain object
            if (typeof value === 'object' && value !== null) {
              if ('value' in value) {
                try {
                  return JSON.parse(value.value);
                } catch {
                  return value.value;
                }
              }
              return value;
            }
            return value;
          };

          const bySection = (sectionName: string) => {
            const section = siteStudyPage.sections?.find((s) => s.section_name === sectionName);
            if (!section || !section.fields) return null;
            
            const result: any = {};
            section.fields.forEach((field: any) => {
              result[field.field_name] = parseFieldValue(field.field_value);
            });
            return result;
          };

          const spaceAssessment = bySection('space_assessment');
          const stakeholders = bySection('stakeholders');
          const requirements = bySection('requirements');
          const infrastructure = bySection('infrastructure');
          const timeline = bySection('timeline');
          const findings = bySection('findings');
          const recommendations = bySection('recommendations');

          // Build siteStudy object
          const siteStudy: SiteStudyData = {
            spaceAssessment: spaceAssessment ? {
              spaceType: spaceAssessment.spaceType || '',
              footfallPattern: spaceAssessment.footfallPattern || '',
              operatingHours: spaceAssessment.operatingHours || '',
              peakTimes: spaceAssessment.peakTimes || '',
              constraints: Array.isArray(spaceAssessment.constraints) ? spaceAssessment.constraints : [],
              layoutPhotos: Array.isArray(spaceAssessment.layoutPhotos) ? spaceAssessment.layoutPhotos : [],
              mounting: spaceAssessment.mounting || {
                mountType: '',
                surfaceMaterial: '',
                drillingRequired: false,
                clearanceAvailable: '',
                distanceToNearest: '',
                accessibleHeight: false
              }
            } : undefined,
            stakeholders: stakeholders?.stakeholders ? (Array.isArray(stakeholders.stakeholders) ? stakeholders.stakeholders : []) : [],
            requirements: requirements ? {
              primaryPurpose: requirements.primaryPurpose || '',
              expectedTransactions: requirements.expectedTransactions || '',
              paymentMethods: Array.isArray(requirements.paymentMethods) ? requirements.paymentMethods : [],
              specialRequirements: Array.isArray(requirements.specialRequirements) ? requirements.specialRequirements : [],
              softwareCategories: Array.isArray(requirements.softwareCategories) ? requirements.softwareCategories : [],
              categoryRequirements: requirements.categoryRequirements || {}
            } : undefined,
            infrastructure: infrastructure ? {
              powerAvailable: infrastructure.powerAvailable === 'true' || infrastructure.powerAvailable === true,
              networkAvailable: infrastructure.networkAvailable === 'true' || infrastructure.networkAvailable === true,
              wifiQuality: infrastructure.wifiQuality || '',
              physicalConstraints: Array.isArray(infrastructure.physicalConstraints) ? infrastructure.physicalConstraints : []
            } : undefined,
            timeline: timeline ? {
              studyDate: timeline.studyDate || '',
              proposedGoLive: timeline.proposedGoLive || '',
              urgency: timeline.urgency || 'normal'
            } : undefined,
            findings: findings?.findings || '',
            recommendations: recommendations?.recommendations || ''
          };

          workflow.siteStudy = siteStudy;
          
          console.log('✅ SiteWorkflowService.getSiteWorkflowData: Loaded site_study page data', {
            hasSpaceAssessment: !!siteStudy.spaceAssessment,
            hasStakeholders: siteStudy.stakeholders?.length > 0,
            hasRequirements: !!siteStudy.requirements,
            hasInfrastructure: !!siteStudy.infrastructure,
            hasTimeline: !!siteStudy.timeline
          });
        }
      } catch (siteStudyErr) {
        console.warn('getSiteWorkflowData: unable to load site_study page', siteStudyErr);
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
      const pageName = 'create_site'; // Save to create_site page, not site_study
      const generalInfoSection = 'general_info';
      const locationInfoSection = 'location_info';

      // Save location data to location_info section
      if (data.locationInfo) {
        const { location, postcode, region, country, latitude, longitude } = data.locationInfo;
        if (location) {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'location', location);
        }
        if (postcode) {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'postcode', postcode);
        }
        if (region) {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'region', region);
        }
        if (country) {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'country', country);
        }
        if (typeof latitude === 'number') {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'latitude', String(latitude));
        }
        if (typeof longitude === 'number') {
          await PageService.updateField(siteId, pageName, locationInfoSection, 'longitude', String(longitude));
        }
      }

      // Save team assignments to general_info section
      if (data.assigned_ops_manager) {
        await PageService.updateField(
          siteId,
          pageName,
          generalInfoSection,
          'assigned_ops_manager',
          String(data.assigned_ops_manager)
        );
      }
      if (data.assigned_deployment_engineer) {
        await PageService.updateField(
          siteId,
          pageName,
          generalInfoSection,
          'assigned_deployment_engineer',
          String(data.assigned_deployment_engineer)
        );
      }

      return true;
    } catch (error) {
      console.error('saveSiteCreationData error:', error);
      return false;
    }
  }

  static async saveSiteStudyData(siteId: string, data: Partial<SiteStudyData>): Promise<boolean> {
    try {
      const pageName = 'site_study';
      
      // Convert complex form data to sections/fields
      // All field values must be strings (JSON stringified for complex objects)
      const sections: Array<{
        section_name: string;
        fields: Array<{ field_name: string; field_value: string }>;
      }> = [];

      // Section: space_assessment
      if (data.spaceAssessment) {
        const spaceFields: Array<{ field_name: string; field_value: string }> = [];
        
        if (data.spaceAssessment.spaceType !== undefined) {
          spaceFields.push({ field_name: 'spaceType', field_value: String(data.spaceAssessment.spaceType) });
        }
        if (data.spaceAssessment.footfallPattern !== undefined) {
          spaceFields.push({ field_name: 'footfallPattern', field_value: String(data.spaceAssessment.footfallPattern) });
        }
        if (data.spaceAssessment.operatingHours !== undefined) {
          spaceFields.push({ field_name: 'operatingHours', field_value: String(data.spaceAssessment.operatingHours) });
        }
        if (data.spaceAssessment.peakTimes !== undefined) {
          spaceFields.push({ field_name: 'peakTimes', field_value: String(data.spaceAssessment.peakTimes) });
        }
        if (data.spaceAssessment.constraints !== undefined) {
          spaceFields.push({ field_name: 'constraints', field_value: JSON.stringify(data.spaceAssessment.constraints) });
        }
        if (data.spaceAssessment.layoutPhotos !== undefined) {
          spaceFields.push({ field_name: 'layoutPhotos', field_value: JSON.stringify(data.spaceAssessment.layoutPhotos) });
        }
        if (data.spaceAssessment.mounting) {
          spaceFields.push({ field_name: 'mounting', field_value: JSON.stringify(data.spaceAssessment.mounting) });
        }
        
        if (spaceFields.length > 0) {
          sections.push({ section_name: 'space_assessment', fields: spaceFields });
        }
      }

      // Section: stakeholders
      if (data.stakeholders !== undefined) {
        sections.push({
          section_name: 'stakeholders',
          fields: [{ field_name: 'stakeholders', field_value: JSON.stringify(data.stakeholders) }]
        });
      }

      // Section: requirements
      if (data.requirements) {
        const reqFields: Array<{ field_name: string; field_value: string }> = [];
        
        if (data.requirements.primaryPurpose !== undefined) {
          reqFields.push({ field_name: 'primaryPurpose', field_value: String(data.requirements.primaryPurpose) });
        }
        if (data.requirements.expectedTransactions !== undefined) {
          reqFields.push({ field_name: 'expectedTransactions', field_value: String(data.requirements.expectedTransactions) });
        }
        if (data.requirements.paymentMethods !== undefined) {
          reqFields.push({ field_name: 'paymentMethods', field_value: JSON.stringify(data.requirements.paymentMethods) });
        }
        if (data.requirements.specialRequirements !== undefined) {
          reqFields.push({ field_name: 'specialRequirements', field_value: JSON.stringify(data.requirements.specialRequirements) });
        }
        if (data.requirements.softwareCategories !== undefined) {
          reqFields.push({ field_name: 'softwareCategories', field_value: JSON.stringify(data.requirements.softwareCategories) });
        }
        if (data.requirements.categoryRequirements !== undefined) {
          reqFields.push({ field_name: 'categoryRequirements', field_value: JSON.stringify(data.requirements.categoryRequirements) });
        }
        
        if (reqFields.length > 0) {
          sections.push({ section_name: 'requirements', fields: reqFields });
        }
      }

      // Section: infrastructure
      if (data.infrastructure) {
        const infraFields: Array<{ field_name: string; field_value: string }> = [];
        
        if (data.infrastructure.powerAvailable !== undefined) {
          infraFields.push({ field_name: 'powerAvailable', field_value: String(data.infrastructure.powerAvailable) });
        }
        if (data.infrastructure.networkAvailable !== undefined) {
          infraFields.push({ field_name: 'networkAvailable', field_value: String(data.infrastructure.networkAvailable) });
        }
        if (data.infrastructure.wifiQuality !== undefined) {
          infraFields.push({ field_name: 'wifiQuality', field_value: String(data.infrastructure.wifiQuality) });
        }
        if (data.infrastructure.physicalConstraints !== undefined) {
          infraFields.push({ field_name: 'physicalConstraints', field_value: JSON.stringify(data.infrastructure.physicalConstraints) });
        }
        
        if (infraFields.length > 0) {
          sections.push({ section_name: 'infrastructure', fields: infraFields });
        }
      }

      // Section: timeline
      if (data.timeline) {
        const timelineFields: Array<{ field_name: string; field_value: string }> = [];
        
        if (data.timeline.studyDate !== undefined) {
          timelineFields.push({ field_name: 'studyDate', field_value: String(data.timeline.studyDate) });
        }
        if (data.timeline.proposedGoLive !== undefined) {
          timelineFields.push({ field_name: 'proposedGoLive', field_value: String(data.timeline.proposedGoLive) });
        }
        if (data.timeline.urgency !== undefined) {
          timelineFields.push({ field_name: 'urgency', field_value: String(data.timeline.urgency) });
        }
        
        if (timelineFields.length > 0) {
          sections.push({ section_name: 'timeline', fields: timelineFields });
        }
      }

      // Section: findings
      if (data.findings !== undefined) {
        sections.push({
          section_name: 'findings',
          fields: [{ field_name: 'findings', field_value: String(data.findings) }]
        });
      }

      // Section: recommendations
      if (data.recommendations !== undefined) {
        sections.push({
          section_name: 'recommendations',
          fields: [{ field_name: 'recommendations', field_value: String(data.recommendations) }]
        });
      }

      // Save all sections to the site_study page
      if (sections.length > 0) {
        // Check if page exists
        const existingPage = await PageService.getPage(pageName, siteId);
        
        if (!existingPage) {
          // Create new page with all sections
          await PageService.createPage({
            page_name: pageName,
            site_id: Number(siteId),
            status: 'site_study_done',
            sections: sections
          });
        } else {
          // Update existing page - update each field
          for (const section of sections) {
            for (const field of section.fields) {
              await PageService.updateField(siteId, pageName, section.section_name, field.field_name, field.field_value);
            }
          }
        }
        
        console.log('✅ SiteWorkflowService.saveSiteStudyData: Saved site study data', {
          siteId,
          sectionsCount: sections.length,
          sections: sections.map(s => s.section_name)
        });
      }

      return true;
    } catch (error) {
      console.error('❌ SiteWorkflowService.saveSiteStudyData: Error saving site study data:', error);
      return false;
    }
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
