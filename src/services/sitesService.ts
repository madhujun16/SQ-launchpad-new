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
  // Location fields
  postcode?: string;
  region?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export class SitesService {
  private static sitesCache: { data: Site[]; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache to reduce API calls

  /**
   * Clear sites cache (call after create/update/delete operations)
   */
  static clearCache(): void {
    this.sitesCache = null;
    console.log('🗑️ SitesService: Cache cleared');
  }

  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Get all sites
   * Backend returns: { message: "...", data: [{ site_id, status, field_name_1: {...}, ... }] }
   */
  static async getAllSites(useCache: boolean = true): Promise<Site[]> {
    try {
      // Check cache first to reduce API calls
      if (useCache && this.sitesCache) {
        const cacheAge = Date.now() - this.sitesCache.timestamp;
        if (cacheAge < this.CACHE_DURATION) {
          console.log('✅ SitesService.getAllSites: Using cached data (age:', Math.round(cacheAge / 1000), 's)');
          return this.sitesCache.data;
        }
      }

      console.log('🔍 SitesService.getAllSites: Calling API endpoint:', API_ENDPOINTS.SITES.LIST);
      const response = await apiClient.get<{
        message: string;
        data: any[];
      }>(API_ENDPOINTS.SITES.LIST);

      console.log('🔍 SitesService.getAllSites: API response:', { 
        success: response.success, 
        hasData: !!response.data,
        dataType: typeof response.data,
        error: response.error 
      });

      // If response is not successful, throw error
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to fetch sites';
        console.error('❌ SitesService.getAllSites: API call failed:', errorMsg, response.error);
        throw new Error(errorMsg);
      }

      // If response.data is null/undefined, return empty array (no sites)
      if (!response.data || !response.data.data) {
        console.log('⚠️ SitesService.getAllSites: No data in response, returning empty array');
        return [];
      }

      // Backend returns sites with fields normalized from create_site/general_info
      // Fields are already extracted and normalized to top-level properties
      // Missing fields are simply not included (not null/empty)
      let sites = Array.isArray(response.data.data) 
        ? response.data.data.map((site: any) => this.transformSite(site))
        : [];
      
      // Backend should provide normalized fields, but use fallback if missing
      // Only fetch pages for sites that are actually missing critical data
      const sitesNeedingData = sites.filter(site => 
        !site.name || site.name === '' || 
        !site.organization_name || site.organization_name === '' || 
        !site.target_live_date || site.target_live_date === ''
      );

      if (sitesNeedingData.length > 0) {
        console.log(`🔍 SitesService.getAllSites: ${sitesNeedingData.length} site(s) missing normalized data, fetching from create_site pages as fallback`);
        
        // Fetch pages in parallel but with error handling
        const pageResults = await Promise.allSettled(
          sitesNeedingData.map(site => 
            PageService.getPage('create_site', site.id)
          )
        );

        // Map results back to sites
        pageResults.forEach((result, index) => {
          const site = sitesNeedingData[index];
          const siteIndex = sites.findIndex(s => s.id === site.id);
          
          if (result.status === 'fulfilled' && result.value) {
            const createSitePage = result.value;
            const generalInfo = createSitePage.sections?.find((s) => s.section_name === 'general_info');
            const locationInfo = createSitePage.sections?.find((s) => s.section_name === 'location_info');
            
            if (generalInfo && generalInfo.fields && generalInfo.fields.length > 0) {
              const byName = (fieldName: string) => {
                const field = generalInfo.fields!.find((f: any) => f.field_name === fieldName);
                if (!field) return null;
                const value = field.field_value;
                // Handle both string and object formats (backward compatibility)
                if (typeof value === 'object' && value !== null) {
                  if ('value' in value) return value.value;
                  if ('text' in value) return value.text;
                  if ('label' in value) return value.label;
                  return value;
                }
                return value;
              };

              // Enrich site with data from create_site/general_info
              const siteName = byName('site_name');
              const orgName = byName('org_name');
              const unitId = byName('unit_id');
              const targetLiveDate = byName('target_live_date');
              const suggestedGoLive = byName('suggested_go_live');
              const assignedOpsManager = byName('assigned_ops_manager');
              const assignedDeploymentEngineer = byName('assigned_deployment_engineer');
              const sector = byName('sector');
              
              if (siteIndex >= 0) {
                if (siteName) sites[siteIndex].name = String(siteName);
                if (orgName) sites[siteIndex].organization_name = String(orgName);
                if (unitId) sites[siteIndex].unit_code = String(unitId);
                if (targetLiveDate) sites[siteIndex].target_live_date = String(targetLiveDate);
                if (suggestedGoLive) sites[siteIndex].suggested_go_live = String(suggestedGoLive);
                if (assignedOpsManager) sites[siteIndex].assigned_ops_manager = String(assignedOpsManager);
                if (assignedDeploymentEngineer) sites[siteIndex].assigned_deployment_engineer = String(assignedDeploymentEngineer);
                if (sector) sites[siteIndex].sector = String(sector);
              }
            }

            // Extract location data
            if (locationInfo && locationInfo.fields && locationInfo.fields.length > 0 && siteIndex >= 0) {
              const byNameLoc = (fieldName: string) => {
                const field = locationInfo.fields!.find((f: any) => f.field_name === fieldName);
                if (!field) return null;
                const value = field.field_value;
                if (typeof value === 'object' && value !== null) {
                  if ('value' in value) return value.value;
                  if ('text' in value) return value.text;
                  if ('label' in value) return value.label;
                  return value;
                }
                return value;
              };
              
              const loc = byNameLoc('location');
              const postcode = byNameLoc('postcode');
              const region = byNameLoc('region');
              const country = byNameLoc('country');
              const lat = byNameLoc('latitude');
              const lng = byNameLoc('longitude');
              
              if (loc) sites[siteIndex].location = String(loc);
              if (postcode) sites[siteIndex].postcode = String(postcode);
              if (region) sites[siteIndex].region = String(region);
              if (country) sites[siteIndex].country = String(country);
              if (lat !== null && lat !== undefined) sites[siteIndex].latitude = Number(lat);
              if (lng !== null && lng !== undefined) sites[siteIndex].longitude = Number(lng);
            }
          } else if (result.status === 'rejected') {
            console.warn(`⚠️ SitesService.getAllSites: Failed to fetch create_site page for site ${site.id}:`, result.reason);
          }
        });
      }
      
      const sitesWithPageData = sites;
      
      // Update cache
      this.sitesCache = {
        data: sitesWithPageData,
        timestamp: Date.now()
      };
      
      console.log('✅ SitesService.getAllSites: Transformed sites:', { count: sitesWithPageData.length });
      return sitesWithPageData;
    } catch (error) {
      console.error('❌ SitesService.getAllSites: Error:', error);
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
   * 
   * Backend normalizes fields from create_site/general_info:
   * - site_name → name
   * - org_name/organization_name → organization_name
   * - unit_id/unit_code → unit_code
   * - Other fields are normalized as-is
   * 
   * Missing fields are not included in response (not null/empty)
   */
  private static transformSite(apiSite: any): Site {
    // Debug: Log the raw API site data to see what backend is returning
    console.log('🔍 SitesService.transformSite: Raw API site data:', {
      site_id: apiSite.site_id || apiSite.id,
      name: apiSite.name,
      organization_name: apiSite.organization_name,
      target_live_date: apiSite.target_live_date,
      suggested_go_live: apiSite.suggested_go_live,
      assigned_ops_manager: apiSite.assigned_ops_manager,
      assigned_deployment_engineer: apiSite.assigned_deployment_engineer,
      sector: apiSite.sector,
      unit_code: apiSite.unit_code,
      status: apiSite.status,
      allKeys: Object.keys(apiSite)
    });
    
    // Backend already normalizes these fields, so use them directly
    // Fallback to empty string if missing (backend doesn't include missing fields)
    const organizationName = apiSite.organization_name || '';
    const unitCode = apiSite.unit_code || '';

    // Normalize status values to UI-friendly variants
    let status: string = apiSite.status || 'Created';
    if (status === 'site-created' || status === 'site_created') {
      status = 'Created';
    }

    return {
      id: apiSite.site_id?.toString() || apiSite.id?.toString() || '',
      name: apiSite.name || '', // Backend normalizes site_name → name
      organization_id: apiSite.organization_id?.toString(),
      organization_name: organizationName, // Backend normalizes org_name → organization_name
      organization_logo: apiSite.organization_logo || '',
      location: apiSite.location || '',
      status,
      target_live_date: apiSite.target_live_date || '', // Missing fields not included, so use empty string
      suggested_go_live: apiSite.suggested_go_live || '',
      assigned_ops_manager: apiSite.assigned_ops_manager || '',
      assigned_deployment_engineer: apiSite.assigned_deployment_engineer || '',
      sector: apiSite.sector || '',
      unit_code: unitCode, // Backend normalizes unit_id → unit_code
      criticality_level: apiSite.criticality_level,
      team_assignment: apiSite.team_assignment,
      stakeholders: apiSite.stakeholders || [],
      notes: apiSite.notes || '',
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
   * 
   * This creates the site and initializes all 7 workflow pages:
   * 1. create_site - with general_info populated (org_name, site_name, unit_id, target_live_date, assigned_ops_manager, assigned_deployment_engineer, sector)
   * 2. site_study - with sections: general_info, study_details, findings, documents
   * 3. scoping - with sections: hardware_requirements, cost_breakdown, approvals
   * 4. approval - with sections: approval_details, comments, attachments
   * 5. procurement - with sections: procurement_items, vendor_info, delivery
   * 6. deployment - with sections: deployment_checklist, installation, testing
   * 7. go_live - with sections: go_live_checklist, activation, post_live
   * 
   * Backend reads from create_site/general_info to populate site list fields.
   * Frontend reads from create_site page to display site details.
   * 
   * Called from:
   * - SiteCreation.tsx (when user clicks "Create Site" from Sites list page)
   */
  static async createSite(siteData: CreateSiteData): Promise<Site | null> {
    try {
      console.log('🔍 SitesService.createSite: Step 1 - Creating site shell with status:', siteData.status || 'Created');
      // Step 1: Create the site (backend creates site with status)
      const siteResponse = await apiClient.post<{
        message: string;
        data?: { site_id: number; status?: string };
      }>(API_ENDPOINTS.SITES.CREATE, {
        status: siteData.status || 'Created',
      });

      console.log('🔍 SitesService.createSite: Step 1 response:', { 
        success: siteResponse.success, 
        data: siteResponse.data,
        error: siteResponse.error 
      });

      if (!siteResponse.success) {
        const errorMsg = siteResponse.error?.message || 'Failed to create site';
        console.error('❌ SitesService.createSite: Step 1 failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const siteId = siteResponse.data?.data?.site_id || siteResponse.data?.site_id;
      if (!siteId) {
        console.error('❌ SitesService.createSite: No site_id in response:', siteResponse.data);
        throw new Error('Site created but no site_id returned');
      }

      console.log('✅ SitesService.createSite: Step 1 success, site_id:', siteId);

      // Step 2: Create the create_site page with ALL form data in general_info and location_info sections
      // This is the FIRST page in the workflow - backend reads from here for site list
      // Backend normalizes: site_name → name, org_name → organization_name, unit_id → unit_code
      // Field values can be {value: "..."}, {text: "..."}, {label: "..."}, or plain string
      // Using {value: "..."} format for consistency
      console.log('🔍 SitesService.createSite: Step 2 - Creating create_site page with ALL form data');
      
      // Check if page already exists (shouldn't happen, but handle gracefully)
      const existingPage = await PageService.getPage('create_site', siteId);
      if (existingPage) {
        console.warn('⚠️ SitesService.createSite: create_site page already exists, skipping creation');
      } else {
        const createSitePageResult = await PageService.createPage({
          page_name: 'create_site', // Backend query needs to look for this (currently looks for 'site_study')
          site_id: siteId,
          status: 'created', // Backend expects lowercase - also updates site status
          sections: [
            {
              section_name: 'general_info', // Backend reads from this section for site list
              fields: [
                { field_name: 'org_name', field_value: String(siteData.organization_name || '') }, // Normalized to organization_name
                { field_name: 'site_name', field_value: String(siteData.name || '') }, // Normalized to name
                { field_name: 'unit_id', field_value: String(siteData.unit_code || '') }, // Normalized to unit_code
                { field_name: 'target_live_date', field_value: String(siteData.target_live_date || '') },
                { field_name: 'suggested_go_live', field_value: String(siteData.target_live_date || '') },
                { field_name: 'assigned_ops_manager', field_value: String(siteData.assigned_ops_manager || '') },
                { field_name: 'assigned_deployment_engineer', field_value: String(siteData.assigned_deployment_engineer || '') },
                { field_name: 'sector', field_value: String(siteData.sector || '') },
                { field_name: 'criticality_level', field_value: String(siteData.criticality_level || 'medium') },
                { field_name: 'organization_id', field_value: String(siteData.organization_id || '') },
                { field_name: 'organization_logo', field_value: '' },
              ],
            },
            {
              section_name: 'location_info', // Location data from form
              fields: [
                { field_name: 'location', field_value: String(siteData.location || '') },
                { field_name: 'postcode', field_value: String(siteData.postcode || '') },
                { field_name: 'region', field_value: String(siteData.region || '') },
                { field_name: 'country', field_value: String(siteData.country || 'United Kingdom') },
                { field_name: 'latitude', field_value: siteData.latitude !== null && siteData.latitude !== undefined ? String(siteData.latitude) : '' },
                { field_name: 'longitude', field_value: siteData.longitude !== null && siteData.longitude !== undefined ? String(siteData.longitude) : '' },
              ],
            },
          ],
        });

        console.log('🔍 SitesService.createSite: Step 2 response:', { 
          success: createSitePageResult.success, 
          error: createSitePageResult.error 
        });

        if (!createSitePageResult.success) {
          // Check if it's a duplicate page error (page already exists)
          const isDuplicateError = createSitePageResult.error?.includes('Duplicate') || 
                                   createSitePageResult.error?.includes('already exists') ||
                                   createSitePageResult.error?.includes('IntegrityError') ||
                                   createSitePageResult.error?.includes('unique constraint');
          
          if (isDuplicateError) {
            console.warn('⚠️ SitesService.createSite: create_site page already exists (duplicate), continuing...');
          } else {
            console.error('❌ SitesService.createSite: Step 2 failed - Site created but failed to create create_site page:', {
              error: createSitePageResult.error,
              siteId,
              siteData: {
                name: siteData.name,
                organization_name: siteData.organization_name
              }
            });
            // Still continue - site was created, just page creation failed
          }
        } else {
          console.log('✅ SitesService.createSite: Step 2 success - create_site page created with ALL form data');
          console.log('✅ SitesService.createSite: Page created with:', {
            page_id: createSitePageResult.data?.page_id,
            sections: createSitePageResult.data?.sections?.map(s => ({
              name: s.section_name,
              fieldsCount: s.fields?.length
            }))
          });
        }
      }

      // Note: Other workflow pages (site_study, scoping, approval, etc.) will be created lazily
      // when the user progresses through those workflow steps. We only create create_site page here.

      // Step 3: Return the created site
      console.log('🔍 SitesService.createSite: Step 4 - Fetching created site by ID:', siteId);
      const createdSite = await this.getSiteById(siteId.toString());
      console.log('✅ SitesService.createSite: Step 4 - Retrieved site:', { 
        hasSite: !!createdSite, 
        siteId: createdSite?.id,
        siteName: createdSite?.name 
      });
      
      // Clear cache so new site appears in list
      this.clearCache();
      
      return createdSite;
    } catch (error) {
      console.error('❌ SitesService.createSite: Fatal error:', error);
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

      // Clear cache after updating site status so Sites list page shows updated status
      if (siteData.status) {
        console.log('🔍 SitesService.updateSite: Clearing cache after status update');
        this.clearCache();
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

  static async deleteSite(siteId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 SitesService.deleteSite: Attempting to delete site:', siteId);
      // Backend: DELETE /api/site?site_id={id}
      const endpoint = API_ENDPOINTS.SITES.DELETE(siteId);
      console.log('🔍 SitesService.deleteSite: Calling endpoint:', endpoint);
      
      const response = await apiClient.delete<{
        message?: string;
        error?: string;
      }>(endpoint);

      console.log('🔍 SitesService.deleteSite: Response:', {
        success: response.success,
        error: response.error,
        statusCode: response.error?.statusCode,
        data: response.data
      });

      if (!response.success) {
        // Handle different error status codes
        const statusCode = response.error?.statusCode;
        let errorMessage = response.error?.message || 'Failed to delete site';
        
        // Extract error message from response data if available
        if (response.data && typeof response.data === 'object') {
          const data = response.data as any;
          if (data.message) errorMessage = data.message;
          else if (data.error) errorMessage = data.error;
        }
        
        // Extract additional details from error.details (contains full error response)
        const errorDetails = response.error?.details;
        if (errorDetails && typeof errorDetails === 'object') {
          const details = errorDetails as any;
          if (details.message && details.message !== errorMessage) {
            errorMessage = details.message;
          } else if (details.error) {
            errorMessage = details.error;
          }
        }
        
        // Provide more specific error messages based on status code
        if (statusCode === 500) {
          // For 500 errors, show the backend's error message if available
          const backendMessage = errorMessage.includes('internal error') 
            ? errorMessage 
            : `Server error: ${errorMessage}`;
          errorMessage = `${backendMessage}. Please contact support if this issue persists.`;
        } else if (statusCode === 404) {
          errorMessage = 'Site not found. It may have already been deleted.';
        } else if (statusCode === 403) {
          errorMessage = 'You do not have permission to delete this site.';
        } else if (statusCode === 400) {
          errorMessage = `Invalid request: ${errorMessage}`;
        }
        
        // Log full error details for debugging
        console.error('❌ SitesService.deleteSite: Delete failed:', {
          siteId,
          statusCode,
          error: response.error,
          errorMessage: response.error?.message,
          errorDetails: response.error?.details,
          responseData: response.data,
          finalErrorMessage: errorMessage
        });
        
        // In development, log the full error response
        if (process.env.NODE_ENV === 'development') {
          console.error('Full error response:', JSON.stringify(response.error, null, 2));
        }
        
        return { success: false, error: errorMessage };
      }

      console.log('✅ SitesService.deleteSite: Site deleted successfully:', siteId);
      
      // Clear cache so deleted site is removed from list
      this.clearCache();
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred while deleting the site';
      console.error('❌ SitesService.deleteSite: Exception:', {
        siteId,
        error,
        message: errorMessage
      });
      return { success: false, error: errorMessage };
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

}
