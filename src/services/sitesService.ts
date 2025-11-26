// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface Site {
  id: string;
  name: string;
  organization_id?: string;
  organization_name: string;
  organization_logo?: string;
  location: string;
  status: string;
  target_live_date?: string;
  suggested_go_live?: string;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
  sector?: string;
  unit_code?: string;
  criticality_level?: 'low' | 'medium' | 'high';
  team_assignment?: string;
  stakeholders?: any[];
  notes?: string;
  unitManagerName?: string;
  jobTitle?: string;
  unitManagerEmail?: string;
  unitManagerMobile?: string;
  additionalContactName?: string;
  additionalContactEmail?: string;
  latitude?: number;
  longitude?: number;
  postcode?: string;
  region?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  sector: string;
  unit_code?: string;
  logo_url?: string;
  description?: string;
  sites_count?: number;
  is_archived?: boolean;
  archived_at?: string;
  archive_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteData {
  name: string;
  organization_id: string;
  organization_name: string;
  location: string;
  target_live_date: string;
  assigned_ops_manager: string;
  assigned_deployment_engineer: string;
  status: string;
  sector?: string;
  unit_code?: string;
  criticality_level?: 'low' | 'medium' | 'high';
  team_assignment?: string;
  stakeholders?: any[];
  description?: string;
}

export class SitesService {
  private static sitesCache: { data: Site[]; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000;

  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static async getAllSites(): Promise<Site[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getSiteById(siteId: string): Promise<Site | null> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getSitesByOrganization(organizationId: string): Promise<Site[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getSitesByStatus(status: string): Promise<Site[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async searchSites(searchTerm: string): Promise<Site[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getAllOrganizations(): Promise<Organization[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getOrganizationsBySector(sector: string): Promise<Organization[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async createSite(siteData: CreateSiteData): Promise<Site | null> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateSite(siteId: string, siteData: Partial<Site>): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async archiveSite(siteId: string, reason: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async unarchiveSite(siteId: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async deleteSite(siteId: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async getAllUsers(): Promise<Array<{ user_id: string; full_name: string; email: string; role: string }>> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async assignUsersToSite(
    siteId: string, 
    opsManagerId: string | null, 
    deploymentEngineerId: string | null
  ): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static clearCache(): void {
    this.sitesCache = null;
    console.log('🔍 Sites cache cleared');
  }
}
