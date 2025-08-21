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
        organization_id: site.organization_id,
        organization_name: site.organization_name,
        organization_logo: site.organizations?.logo_url || null, // Get logo from organizations table
        location: site.location,
        status: site.status,
        target_live_date: site.target_live_date,
        assigned_ops_manager: site.assigned_ops_manager,
        assigned_deployment_engineer: site.assigned_deployment_engineer,
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
        organization_id: data.organization_id,
        organization_name: data.organization_name,
        organization_logo: data.organizations?.logo_url || null, // Get logo from organizations table
        location: data.location,
        status: data.status,
        target_live_date: data.target_live_date,
        assigned_ops_manager: data.assigned_ops_manager,
        assigned_deployment_engineer: data.assigned_deployment_engineer,
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
      const { error } = await supabase
        .from('sites')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error updating site status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSiteStatus:', error);
      return false;
    }
  }

  // Create new site
  static async createSite(siteData: Partial<Site>): Promise<Site | null> {
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
