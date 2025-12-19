// Organization Service - CRUD operations with Flask backend API

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { AuthService } from './authService';

// All organization operations now use real backend API

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

export interface CreateOrganizationPayload {
  name: string;
  sector: string;
  unit_code?: string;
  logo_url?: string;
  description?: string;
}

export interface UpdateOrganizationPayload extends Partial<CreateOrganizationPayload> {
  id: string;
}

export interface OrganizationResponse {
  success: boolean;
  organization?: Organization;
  organizations?: Organization[];
  message?: string;
  error?: string;
}

export class OrganizationService {
  /**
   * Get all organizations
   */
  static async getAllOrganizations(): Promise<Organization[]> {
    try {
      // Backend: GET /api/organization?organization_id=all
      // Different environments may wrap the data slightly differently, so we
      // handle multiple shapes here instead of assuming one exact format.
      const response = await apiClient.get<any>(API_ENDPOINTS.ORGANIZATIONS.LIST('all'));

      // Handle 401 Unauthorized - user needs to login
      if (response.error?.statusCode === 401) {
        console.warn('🔒 Authentication required for organizations API - session may have expired');
        console.warn('Response error:', response.error);
        
        // Clear auth and return empty array (UI should handle redirect)
        if (typeof window !== 'undefined') {
          AuthService.clearAuth();
          
          // Show a toast message (dynamic import to avoid circular dependency)
          import('sonner').then(({ toast }) => {
            toast.error('Session expired. Please login again.');
          });
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/auth') {
            setTimeout(() => {
              window.location.href = '/auth';
            }, 1000);
          }
        }
        return [];
      }

      if (!response.success || !response.data) {
        const errorMessage = response.error?.message || 'Failed to fetch organizations';
        console.error('getAllOrganizations error:', errorMessage);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }

      // Log raw payload once for debugging different backend shapes
      console.log('getAllOrganizations raw payload:', response.data);

      // Backend may return:
      // 1) { message, data: [...] }
      // 2) { success, data: [...] }
      // 3) { organizations: [...] }
      // 4) Just an array [...]
      let organizationsRaw: any[] = [];

      const payload = response.data as any;

      if (Array.isArray(payload)) {
        organizationsRaw = payload;
      } else if (Array.isArray(payload.data)) {
        organizationsRaw = payload.data;
      } else if (Array.isArray(payload.organizations)) {
        organizationsRaw = payload.organizations;
      } else if (payload.data && Array.isArray(payload.data.data)) {
        // Handle double-wrapped case: { data: { data: [...] } }
        organizationsRaw = payload.data.data;
      } else {
        console.warn('getAllOrganizations: Unexpected payload shape, defaulting to empty list');
        organizationsRaw = [];
      }
      
      return organizationsRaw.map((org: any) => this.transformOrganization(org));
    } catch (error) {
      console.error('getAllOrganizations error:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      // Backend: GET /api/organization?organization_id={id}
      const response = await apiClient.get<{ 
        message: string;
        data: any[];
      }>(API_ENDPOINTS.ORGANIZATIONS.LIST(id));

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch organization');
      }

      // Backend returns array even for single org
      const orgs = response.data.data || [];
      return orgs.length > 0 ? this.transformOrganization(orgs[0]) : null;
    } catch (error) {
      console.error('getOrganizationById error:', error);
      return null;
    }
  }

  /**
   * Create a new organization
   */
  static async createOrganization(
    payload: CreateOrganizationPayload
  ): Promise<OrganizationResponse> {
    try {
      // Backend expects: { name, description, sector, unit_code, organization_logo }
      // Only include organization_logo if it's actually provided (not empty string)
      const backendPayload: any = {
        name: payload.name.trim(),
        description: payload.description?.trim() || '',
        sector: payload.sector,
        unit_code: payload.unit_code?.trim() || '',
      };

      // Only include organization_logo if it's provided and not empty
      if (payload.logo_url && payload.logo_url.trim()) {
        backendPayload.organization_logo = payload.logo_url.trim();
      }

      console.log('createOrganization payload:', backendPayload);

      const response = await apiClient.post<{ 
        message: string;
        data: any;
      }>(API_ENDPOINTS.ORGANIZATIONS.CREATE, backendPayload);

      // Log error details for debugging
      if (!response.success && response.error) {
        console.error('createOrganization error response:', {
          statusCode: response.error.statusCode,
          message: response.error.message,
          details: response.error.details,
        });
      }

      // Handle 401 Unauthorized - user needs to login
      if (response.error?.statusCode === 401) {
        console.warn('Authentication required for creating organization');
        if (typeof window !== 'undefined') {
          AuthService.clearAuth();
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        return {
          success: false,
          error: 'Authentication required. Please login again.',
        };
      }

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to create organization',
        };
      }

      // Backend returns { message, data: {...} }
      return {
        success: true,
        organization: response.data?.data 
          ? this.transformOrganization(response.data.data) 
          : undefined,
        message: response.data?.message || 'Organization created successfully',
      };
    } catch (error) {
      console.error('createOrganization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create organization',
      };
    }
  }

  /**
   * Update an organization
   */
  static async updateOrganization(
    id: string,
    payload: Partial<CreateOrganizationPayload>
  ): Promise<OrganizationResponse> {
    try {
      // Backend PUT expects id in body along with other fields
      const backendPayload = {
        id: parseInt(id),
        name: payload.name,
        description: payload.description || '',
        sector: payload.sector,
        unit_code: payload.unit_code || '',
        organization_logo: payload.logo_url || '',
      };

      const response = await apiClient.put<{ 
        message: string;
        data?: any;
      }>(API_ENDPOINTS.ORGANIZATIONS.UPDATE, backendPayload);

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to update organization',
        };
      }

      return {
        success: true,
        organization: response.data?.data 
          ? this.transformOrganization(response.data.data) 
          : undefined,
        message: response.data?.message || 'Organization updated successfully',
      };
    } catch (error) {
      console.error('updateOrganization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update organization',
      };
    }
  }

  /**
   * Delete an organization
   */
  static async deleteOrganization(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Backend: DELETE /api/organization?organization_id={id}
      const response = await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(id));
      
      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to delete organization',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('deleteOrganization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete organization',
      };
    }
  }

  /**
   * Transform API organization response to our Organization format
   * Backend returns: { org_id, name, description, sector, unit_code, organization_logo, created_at, updated_at }
   */
  private static transformOrganization(apiOrg: any): Organization {
    return {
      id: apiOrg.org_id?.toString() || apiOrg.id?.toString() || '',
      name: apiOrg.name || '',
      sector: apiOrg.sector || '',
      unit_code: apiOrg.unit_code,
      logo_url: apiOrg.organization_logo || apiOrg.logo_url || apiOrg.logo,
      description: apiOrg.description,
      sites_count: apiOrg.sites_count || 0,
      is_archived: apiOrg.is_archived || false,
      archived_at: apiOrg.archived_at,
      archive_reason: apiOrg.archive_reason,
      created_at: apiOrg.created_at || new Date().toISOString(),
      updated_at: apiOrg.updated_at || new Date().toISOString(),
    };
  }
}

export default OrganizationService;

