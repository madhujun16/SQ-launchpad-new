import { supabase } from '@/integrations/supabase/client';

export interface Site {
  id: string;
  name: string;
  organization_id?: string;
  organization_name: string;
  organization_logo?: string;
  location: string;
  status: string;
  target_live_date?: string;
  assigned_ops_manager?: string;
  assigned_deployment_engineer?: string;
  sector?: string;
  unit_code?: string;
  criticality_level?: 'low' | 'medium' | 'high';
  team_assignment?: string;
  stakeholders?: any[];
  notes?: string;
  // Contact information fields
  unitManagerName?: string;
  jobTitle?: string;
  unitManagerEmail?: string;
  unitManagerMobile?: string;
  additionalContactName?: string;
  additionalContactEmail?: string;
  // Location fields
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
  logo_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteData {
  name: string;
  organization_id: string;
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
  description?: string; // Use description field for notes
}

export class SitesService {
  // Get all sites with organization information
  static async getAllSites(): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          organizations (
            id,
            name,
            sector,
            logo_url,
            description
          )
        `)
        .order('name');

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      // Transform the data to match our Site interface
      return data?.map((site: any) => ({
        id: site.id,
        name: site.name,
        organization_id: site.organization_id || site.organizations?.id || '',
        organization_name: site.organization_name || site.organizations?.name || '',
        organization_logo: site.organizations?.logo_url || null,
        location: site.location || site.address || '',
        status: site.status,
        target_live_date: site.target_live_date || site.go_live_date || '',
        assigned_ops_manager: site.assigned_ops_manager || site.assigned_ops_manager_id || '',
        assigned_deployment_engineer: site.assigned_deployment_engineer || site.assigned_deployment_engineer_id || '',
        sector: site.sector || '',
        unit_code: site.unit_code || '',
        criticality_level: site.criticality_level || 'medium',
        team_assignment: site.team_assignment || '',
        stakeholders: site.stakeholders || [],
        notes: site.description || site.notes || '',
        // Contact information fields (optional, may not exist in database yet)
        unitManagerName: site.unit_manager_name || '',
        jobTitle: site.job_title || '',
        unitManagerEmail: site.unit_manager_email || '',
        unitManagerMobile: site.unit_manager_mobile || '',
        additionalContactName: site.additional_contact_name || '',
        additionalContactEmail: site.additional_contact_email || '',
        // Location fields (optional, may not exist in database yet)
        latitude: site.latitude,
        longitude: site.longitude,
        postcode: site.postcode,
        region: site.region,
        country: site.country,
        created_at: site.created_at,
        updated_at: site.updated_at
      })) || [];
    } catch (error) {
      console.error('Error in getAllSites:', error);
      return [];
    }
  }

  // Get site by ID
  static async getSiteById(siteId: string): Promise<Site | null> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          organizations (
            id,
            name,
            sector,
            logo_url,
            description
          )
        `)
        .eq('id', siteId)
        .single();

      if (error) {
        console.error('Error fetching site:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        organization_id: data.organization_id || data.organizations?.id || '',
        organization_name: data.organization_name || data.organizations?.name || '',
        organization_logo: data.organizations?.logo_url || null,
        location: data.location || data.address || '',
        status: data.status,
        target_live_date: data.target_live_date || data.go_live_date || '',
        assigned_ops_manager: data.assigned_ops_manager || data.assigned_ops_manager_id || '',
        assigned_deployment_engineer: data.assigned_deployment_engineer || data.assigned_deployment_engineer_id || '',
        sector: data.sector || '',
        unit_code: data.unit_code || '',
        criticality_level: data.criticality_level || 'medium',
        team_assignment: data.team_assignment || '',
        stakeholders: data.stakeholders || [],
        notes: data.description || data.notes || '',
        // Contact information fields (optional, may not exist in database yet)
        unitManagerName: data.unit_manager_name || '',
        jobTitle: data.job_title || '',
        unitManagerEmail: data.unit_manager_email || '',
        unitManagerMobile: data.unit_manager_mobile || '',
        additionalContactName: data.additional_contact_name || '',
        additionalContactEmail: data.additional_contact_email || '',
        // Location fields (optional, may not exist in database yet)
        latitude: data.latitude,
        longitude: data.longitude,
        postcode: data.postcode,
        region: data.region,
        country: data.country,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error in getSiteById:', error);
      return null;
    }
  }

  // Get sites by organization
  static async getSitesByOrganization(organizationId: string): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) {
        console.error('Error fetching sites by organization:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSitesByOrganization:', error);
      return [];
    }
  }

  // Get sites by status
  static async getSitesByStatus(status: string): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('status', status)
        .order('name');

      if (error) {
        console.error('Error fetching sites by status:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSitesByStatus:', error);
      return [];
    }
  }

  // Search sites by name or location
  static async searchSites(searchTerm: string): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('name');

      if (error) {
        console.error('Error searching sites:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchSites:', error);
      return [];
    }
  }

  // Get all organizations
  static async getAllOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      return [];
    }
  }

  // Get organizations by sector
  static async getOrganizationsBySector(sector: string): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('sector', sector)
        .order('name');

      if (error) {
        console.error('Error fetching organizations by sector:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrganizationsBySector:', error);
      return [];
    }
  }

  // Update site status
  static async updateSiteStatus(siteId: string, status: string): Promise<boolean> {
    try {
      console.log('Attempting to update site status:', { siteId, status });
      
      // First, let's check if the site exists
      const { data: existingSite, error: fetchError } = await supabase
        .from('sites')
        .select('id, status')
        .eq('id', siteId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing site:', fetchError);
        return false;
      }

      if (!existingSite) {
        console.error('Site not found:', siteId);
        return false;
      }

      console.log('Current site status:', existingSite.status);

      // Update the status
      const { error: updateError } = await supabase
        .from('sites')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (updateError) {
        console.error('Error updating site status:', updateError);
        console.error('Error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        return false;
      }

      console.log('Site status updated successfully');
      return true;
    } catch (error) {
      console.error('Exception in updateSiteStatus:', error);
      return false;
    }
  }

  // Create new site
  static async createSite(siteData: CreateSiteData): Promise<Site | null> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .insert([siteData])
        .select()
        .single();

      if (error) {
        console.error('Error creating site:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createSite:', error);
      return null;
    }
  }

  // Update site
  static async updateSite(siteId: string, siteData: Partial<Site>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sites')
        .update({ 
          ...siteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error updating site:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSite:', error);
      return false;
    }
  }

  // Delete site
  static async deleteSite(siteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', siteId);

      if (error) {
        console.error('Error deleting site:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSite:', error);
      return false;
    }
  }
}
