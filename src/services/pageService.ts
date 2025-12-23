// Page Service - Manages workflow pages (stages) for sites
// Hierarchy: Site → Pages (workflow stages) → Sections (logical groupings) → Fields (data points)

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

// Workflow stage to page name mapping
export const WORKFLOW_PAGE_MAP: Record<string, string> = {
  'Created': 'create_site',
  'site_study_done': 'site_study',
  'scoping_done': 'scoping',
  'approved': 'approval',
  'procurement_done': 'procurement',
  'deployed': 'deployment',
  'live': 'go_live',
};

// Reverse mapping: page name to status
export const PAGE_STATUS_MAP: Record<string, string> = {
  'create_site': 'Created',
  'site_study': 'site_study_done',
  'scoping': 'scoping_done',
  'approval': 'approved',
  'procurement': 'procurement_done',
  'deployment': 'deployed',
  'go_live': 'live',
};

export interface Field {
  field_id?: number;
  field_name: string;
  field_value: any; // JSON object - flexible schema
  section_id?: number;
}

export interface Section {
  section_id?: number;
  section_name: string;
  page_id?: number;
  fields: Field[];
}

export interface Page {
  page_id?: number;
  page_name: string;
  site_id: number;
  created_at?: string;
  updated_at?: string;
  sections: Section[];
}

export interface CreatePagePayload {
  page_name: string;
  site_id?: number; // Optional: creates new site if not provided
  status?: string; // Site status if creating new site
  sections: Array<{
    section_name: string;
    fields: Array<{
      field_name: string;
      field_value: any; // JSON object
    }>;
  }>;
}

export interface UpdatePagePayload {
  id: number; // Page ID (required for updates)
  page_name?: string;
  site_id?: number;
  status?: string; // Updates site status
  sections: Array<{
    section_id?: number; // Required for updates
    section_name: string;
    fields: Array<{
      field_id?: number; // Required for updates
      field_name?: string;
      field_value: any; // JSON object
    }>;
  }>;
}

export interface PageResponse {
  success: boolean;
  page?: Page;
  message?: string;
  error?: string;
}

export class PageService {
  /**
   * Get a page with all sections and fields
   * @param pageName - Name of the page (e.g., 'site_study', 'scoping')
   * @param siteId - Site ID
   */
  static async getPage(pageName: string, siteId: number | string): Promise<Page | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: Page;
      }>(API_ENDPOINTS.PAGES.GET(pageName, siteId));

      // If page doesn't exist (404), return null gracefully
      if (!response.success) {
        const isPageNotFound = (response.error?.statusCode === 404 || response.error?.statusCode === 400) && 
                               (response.error?.message?.includes('not found') || 
                                response.error?.message?.includes('Invalid Page') ||
                                response.error?.message?.includes('Invalid page'));
        
        if (isPageNotFound) {
          // Page doesn't exist yet - this is OK (normal for sites created before create_site page was implemented)
          console.log(`ℹ️ Page "${pageName}" not found for site ${siteId} (404 - this is normal for existing sites)`);
          return null;
        }
        // For other errors, log but still return null
        console.warn(`getPage error for ${pageName} (site ${siteId}):`, response.error?.message);
        return null;
      }

      if (!response.data?.data) {
        return null;
      }

      // Backend returns { message, data: { page_id, page_name, site_id, sections: [...] } }
      return response.data.data;
    } catch (error) {
      console.error('getPage error:', error);
      return null;
    }
  }

  /**
   * Get page for a workflow stage
   * @param status - Site status (e.g., 'site_study_done')
   * @param siteId - Site ID
   */
  static async getPageByStatus(status: string, siteId: number | string): Promise<Page | null> {
    const pageName = WORKFLOW_PAGE_MAP[status] || status.toLowerCase().replace(/_/g, '_');
    return this.getPage(pageName, siteId);
  }

  /**
   * Create a new page (workflow stage) for a site
   * @param payload - Page creation payload
   */
  static async createPage(payload: CreatePagePayload): Promise<PageResponse> {
    try {
      console.log('createPage payload:', JSON.stringify(payload, null, 2));
      
      const response = await apiClient.post<{
        message: string;
        data: Page;
      }>(API_ENDPOINTS.PAGES.CREATE, payload);

      if (!response.success) {
        console.error('createPage error response:', {
          statusCode: response.error?.statusCode,
          message: response.error?.message,
          details: response.error?.details,
        });
        return {
          success: false,
          error: response.error?.message || 'Failed to create page',
        };
      }

      return {
        success: true,
        page: response.data?.data,
        message: response.data?.message || 'Page created successfully',
      };
    } catch (error) {
      console.error('createPage error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create page',
      };
    }
  }

  /**
   * Update a page (workflow stage)
   * @param payload - Page update payload (must include id)
   */
  static async updatePage(payload: UpdatePagePayload): Promise<PageResponse> {
    try {
      const response = await apiClient.put<{
        message: string;
        data?: Page;
      }>(API_ENDPOINTS.PAGES.UPDATE, payload);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to update page',
        };
      }

      return {
        success: true,
        page: response.data?.data,
        message: response.data?.message || 'Page updated successfully',
      };
    } catch (error) {
      console.error('updatePage error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update page',
      };
    }
  }

  /**
   * Create or update a field value
   * This is a helper method to update a single field within a section
   */
  static async updateField(
    siteId: number | string,
    pageName: string,
    sectionName: string,
    fieldName: string,
    fieldValue: any
  ): Promise<PageResponse> {
    try {
      // First, get the current page
      const currentPage = await this.getPage(pageName, siteId);

      if (!currentPage) {
        // Page doesn't exist, create it with the field
        // Backend expects field_value to be an object, so wrap if it's a primitive
        const wrappedValue = typeof fieldValue === 'object' && fieldValue !== null 
          ? fieldValue 
          : { value: fieldValue };
        
        return this.createPage({
          page_name: pageName,
          site_id: Number(siteId),
          status: 'created', // Backend expects lowercase
          sections: [
            {
              section_name: sectionName,
              fields: [
                {
                  field_name: fieldName,
                  field_value: wrappedValue,
                },
              ],
            },
          ],
        });
      }

      // Find or create section
      let section = currentPage.sections.find(s => s.section_name === sectionName);
      if (!section) {
        section = {
          section_name: sectionName,
          fields: [],
        };
        currentPage.sections.push(section);
      }

      // Find existing field or prepare to add new one
      let field = section.fields.find(f => f.field_name === fieldName);
      if (field) {
        // Field exists - update it (requires field_id for PUT /api/page)
        field.field_value = fieldValue;
      } else {
        // Field doesn't exist - need to add it
        // For new fields, we need to create them via POST /api/page or add to existing page
        // Since we're updating, we'll add it to the sections array
        section.fields.push({
          field_name: fieldName,
          field_value: fieldValue,
        });
      }

      // Update the page using PUT /api/page
      // Backend requires: page_id, section_id for each section, field_id for each field
      return this.updatePage({
        id: currentPage.page_id!,
        sections: currentPage.sections.map(s => ({
          section_id: s.section_id, // Required for updates
          section_name: s.section_name,
          fields: s.fields.map(f => ({
            field_id: f.field_id, // Required for updates - existing fields have this
            field_name: f.field_name,
            field_value: f.field_value,
          })),
        })),
      });
    } catch (error) {
      console.error('updateField error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update field',
      };
    }
  }

  /**
   * Get field value from a page
   */
  static async getFieldValue(
    siteId: number | string,
    pageName: string,
    sectionName: string,
    fieldName: string
  ): Promise<any | null> {
    try {
      const page = await this.getPage(pageName, siteId);
      if (!page) return null;

      const section = page.sections.find(s => s.section_name === sectionName);
      if (!section) return null;

      const field = section.fields.find(f => f.field_name === fieldName);
      return field?.field_value || null;
    } catch (error) {
      console.error('getFieldValue error:', error);
      return null;
    }
  }

  /**
   * Initialize workflow pages for a new site
   * Creates all 7 standard workflow pages with their sections
   * Pages are created in workflow order: create_site → site_study → scoping → approval → procurement → deployment → go_live
   */
  static async initializeSiteWorkflow(siteId: number | string): Promise<{ success: boolean; errors?: string[] }> {
    // All 7 workflow pages in order: create_site → site_study → scoping → approval → procurement → deployment → go_live
    const workflowPages = [
      { 
        name: 'create_site', 
        sections: ['general_info', 'location_info', 'stakeholders'],
        description: 'Initial site creation with basic info and location'
      },
      { 
        name: 'site_study', 
        sections: ['general_info', 'study_details', 'findings', 'documents'],
        description: 'Site study and assessment data'
      },
      { 
        name: 'scoping', 
        sections: ['hardware_requirements', 'cost_breakdown', 'approvals'],
        description: 'Hardware and software scoping with cost breakdown'
      },
      { 
        name: 'approval', 
        sections: ['approval_details', 'comments', 'attachments'],
        description: 'Approval workflow and comments'
      },
      { 
        name: 'procurement', 
        sections: ['procurement_items', 'vendor_info', 'delivery'],
        description: 'Procurement tracking and vendor information'
      },
      { 
        name: 'deployment', 
        sections: ['deployment_checklist', 'installation', 'testing'],
        description: 'Deployment process and installation tracking'
      },
      { 
        name: 'go_live', 
        sections: ['go_live_checklist', 'activation', 'post_live'],
        description: 'Go-live process and post-launch monitoring'
      },
    ];

    const errors: string[] = [];

    for (const page of workflowPages) {
      // Check if page already exists (e.g., create_site might be created separately with data)
      const existingPage = await this.getPage(page.name, siteId);
      if (existingPage) {
        console.log(`✅ Page "${page.name}" already exists (${existingPage.sections?.length || 0} sections), skipping creation`);
        continue;
      }

      console.log(`🔍 Creating page "${page.name}" with sections: ${page.sections.join(', ')}`);
      const result = await this.createPage({
        page_name: page.name,
        site_id: Number(siteId),
        status: 'created', // Backend expects lowercase
        sections: page.sections.map(sectionName => ({
          section_name: sectionName,
          fields: [], // Empty fields initially - will be populated as workflow progresses
        })),
      });

      if (!result.success) {
        const errorMsg = `Failed to create ${page.name}: ${result.error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      } else {
        console.log(`✅ Page "${page.name}" created successfully`);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export default PageService;

