// Sites Service - Manages sites with page-based workflow integration

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { PageService } from './pageService';
import { OrganizationService } from './organizationService';

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

  /**
   * Get all sites
   * Backend returns: { message: "...", data: [{ site_id, status, field_name_1: {...}, ... }] }
   */
  static async getAllSites(): Promise<Site[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: any[];
      }>(API_ENDPOINTS.SITES.LIST);

      // If response is not successful, throw error
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch sites');
      }

      // If response.data is null/undefined, return empty array (no sites)
      if (!response.data || !response.data.data) {
        return [];
      }

      // Backend returns sites with fields as top-level properties
      // Transform to our Site format
      const sites = Array.isArray(response.data.data) 
        ? response.data.data.map((site: any) => this.transformSite(site))
        : [];
      
      return sites;
    } catch (error) {
      console.error('getAllSites error:', error);
      throw error;
    }
  }

  /**
   * Get site by ID
   * Note: Backend may not have a direct GET /api/site/{id} endpoint
   * We may need to filter from getAllSites or use page data
   */
  static async getSiteById(siteId: string): Promise<Site | null> {
    try {
      // Try to get from all sites first
      const allSites = await this.getAllSites();
      const site = allSites.find(s => s.id === siteId);
      if (site) return site;

      // If not found, try to get from create_site page
      const createPage = await PageService.getPage('create_site', siteId);
      if (createPage) {
        // Extract site data from page fields
        return this.siteFromPage(createPage, siteId);
      }

      return null;
    } catch (error) {
      console.error('getSiteById error:', error);
      return null;
    }
  }

  /**
   * Transform site data from page fields
   */
  private static siteFromPage(page: any, siteId: string): Site {
    // Extract site data from page sections/fields
    const site: Partial<Site> = {
      id: siteId,
      name: '',
      organization_name: '',
      location: '',
      status: 'Created',
    };

    // Extract data from sections
    page.sections?.forEach((section: any) => {
      section.fields?.forEach((field: any) => {
        if (field.field_name === 'site_name') site.name = field.field_value?.text || field.field_value || '';
        if (field.field_name === 'organization_name') site.organization_name = field.field_value?.text || field.field_value || '';
        if (field.field_name === 'location') site.location = field.field_value?.text || field.field_value || '';
        if (field.field_name === 'status') site.status = field.field_value?.text || field.field_value || '';
        // Add more field mappings as needed
      });
    });

    return site as Site;
  }

  /**
   * Transform backend site response to our Site format
   */
  private static transformSite(apiSite: any): Site {
    // Normalize organization and unit fields from current backend payload
    const organizationName = apiSite.organization_name || apiSite.org_name || '';
    const unitCode = apiSite.unit_code || apiSite.unit_id;

    // Normalize status values to UI-friendly variants
    let status: string = apiSite.status || 'Created';
    if (status === 'site-created' || status === 'site_created') {
      status = 'Created';
    }

    return {
      id: apiSite.site_id?.toString() || apiSite.id?.toString() || '',
      name: apiSite.name || apiSite.site_name || '',
      organization_id: apiSite.organization_id?.toString(),
      organization_name: organizationName,
      organization_logo: apiSite.organization_logo,
      location: apiSite.location || '',
      status,
      target_live_date: apiSite.target_live_date,
      suggested_go_live: apiSite.suggested_go_live,
      assigned_ops_manager: apiSite.assigned_ops_manager,
      assigned_deployment_engineer: apiSite.assigned_deployment_engineer,
      sector: apiSite.sector,
      unit_code: unitCode,
      criticality_level: apiSite.criticality_level,
      team_assignment: apiSite.team_assignment,
      stakeholders: apiSite.stakeholders,
      notes: apiSite.notes,
      unitManagerName: apiSite.unitManagerName,
      jobTitle: apiSite.jobTitle,
      unitManagerEmail: apiSite.unitManagerEmail,
      unitManagerMobile: apiSite.unitManagerMobile,
      additionalContactName: apiSite.additionalContactName,
      additionalContactEmail: apiSite.additionalContactEmail,
      latitude: apiSite.latitude,
      longitude: apiSite.longitude,
      postcode: apiSite.postcode,
      region: apiSite.region,
      country: apiSite.country,
      created_at: apiSite.created_at || new Date().toISOString(),
      updated_at: apiSite.updated_at || new Date().toISOString(),
    };
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
    // Reuse the shared OrganizationService so both Sites and Organizations pages
    // see the same data and we only have one place that knows the backend shape.
    const orgs = await OrganizationService.getAllOrganizations();

    return orgs.map((org: any): Organization => ({
      id: org.id,
      name: org.name,
      sector: org.sector,
      unit_code: org.unit_code,
      logo_url: org.logo_url,
      description: org.description,
      sites_count: org.sites_count,
      is_archived: org.is_archived,
      archived_at: org.archived_at,
      archive_reason: org.archive_reason,
      created_at: org.created_at,
      updated_at: org.updated_at,
    }));
  }

  static async getOrganizationsBySector(sector: string): Promise<Organization[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  /**
   * Create a new site
   * This creates the site and initializes all workflow pages
   */
  static async createSite(siteData: CreateSiteData): Promise<Site | null> {
    try {
      // Step 1: Create the site (backend creates site with status)
      const siteResponse = await apiClient.post<{
        message: string;
        data?: { site_id: number; status?: string };
      }>(API_ENDPOINTS.SITES.CREATE, {
        status: siteData.status || 'Created',
      });

      if (!siteResponse.success) {
        throw new Error(siteResponse.error?.message || 'Failed to create site');
      }

      const siteId = siteResponse.data?.data?.site_id || siteResponse.data?.site_id;
      if (!siteId) {
        throw new Error('Site created but no site_id returned');
      }

      // Step 2: Create the site_study page with all general_info fields at once
      // This is more efficient and avoids multiple failed page creation attempts
      // Backend expects field_value to be an object, so we wrap string values in { value: ... }
      const siteStudyPageResult = await PageService.createPage({
        page_name: 'site_study',
        site_id: siteId,
        status: 'created', // Backend expects lowercase
        sections: [
          {
            section_name: 'general_info',
            fields: [
              { field_name: 'org_name', field_value: { value: siteData.organization_name } },
              { field_name: 'site_name', field_value: { value: siteData.name } },
              { field_name: 'unit_id', field_value: { value: siteData.unit_code || '' } },
              { field_name: 'target_live_date', field_value: { value: siteData.target_live_date } },
              { field_name: 'suggested_go_live', field_value: { value: siteData.target_live_date } },
              { field_name: 'assigned_ops_manager', field_value: { value: siteData.assigned_ops_manager || '' } },
              { field_name: 'assigned_deployment_engineer', field_value: { value: siteData.assigned_deployment_engineer || '' } },
              { field_name: 'sector', field_value: { value: siteData.sector || '' } },
              { field_name: 'organization_logo', field_value: { value: '' } },
            ],
          },
        ],
      });

      if (!siteStudyPageResult.success) {
        console.warn('Site created but failed to create site_study page:', siteStudyPageResult.error);
      }

      // Step 3: Initialize remaining workflow pages (create_site, scoping, approval, etc.)
      const initResult = await PageService.initializeSiteWorkflow(siteId);
      if (!initResult.success) {
        console.warn('Site created but failed to initialize some workflow pages:', initResult.errors);
      }

      // Step 4: Return the created site
      const createdSite = await this.getSiteById(siteId.toString());
      return createdSite;
    } catch (error) {
      console.error('createSite error:', error);
      return null;
    }
  }

  /**
   * Update a site
   * Updates site status and updates/create the corresponding workflow page
   */
  static async updateSite(siteId: string, siteData: Partial<Site>): Promise<boolean> {
    try {
      // Step 1: Update site status if provided
      if (siteData.status) {
        const updateResponse = await apiClient.put<{
          message: string;
        }>(API_ENDPOINTS.SITES.UPDATE, {
          id: Number(siteId),
          name: siteData.name || '',
          status: siteData.status,
        });

        if (!updateResponse.success) {
          throw new Error(updateResponse.error?.message || 'Failed to update site');
        }

        // Step 2: Update/create the corresponding workflow page
        const pageName = PageService.WORKFLOW_PAGE_MAP[siteData.status] || siteData.status.toLowerCase();
        const currentPage = await PageService.getPage(pageName, siteId);

        if (currentPage) {
          // Update existing page
          await PageService.updatePage({
            id: currentPage.page_id!,
            sections: currentPage.sections.map(section => ({
              section_id: section.section_id,
              section_name: section.section_name,
              fields: section.fields.map(field => ({
                field_id: field.field_id,
                field_name: field.field_name,
                field_value: field.field_value,
              })),
            })),
          });
        } else {
          // Create new page for this workflow stage
          await PageService.createPage({
            page_name: pageName,
            site_id: Number(siteId),
            sections: [], // Empty sections, will be populated as workflow progresses
          });
        }
      } else {
        // Just update site without changing workflow stage
        const updateResponse = await apiClient.put<{
          message: string;
        }>(API_ENDPOINTS.SITES.UPDATE, {
          id: Number(siteId),
          name: siteData.name || '',
          status: siteData.status || 'Created',
        });

        if (!updateResponse.success) {
          throw new Error(updateResponse.error?.message || 'Failed to update site');
        }
      }

      return true;
    } catch (error) {
      console.error('updateSite error:', error);
      return false;
    }
  }

  static async archiveSite(siteId: string, reason: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async unarchiveSite(siteId: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static async deleteSite(siteId: string): Promise<boolean> {
    try {
      // Backend: DELETE /api/site?site_id={id}
      const response = await apiClient.delete<{
        message?: string;
      }>(API_ENDPOINTS.SITES.DELETE(siteId));

      if (!response.success) {
        console.error('deleteSite error:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('deleteSite error:', error);
      return false;
    }
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
