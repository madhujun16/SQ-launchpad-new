import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

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
  sites_count?: number; // Number of sites mapped to this organization
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
  // Simple in-memory cache for sites
  private static sitesCache: { data: Site[]; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get all sites with user assignments
  static async getAllSites(): Promise<Site[]> {
    try {
      // Check cache first
      if (this.sitesCache && (Date.now() - this.sitesCache.timestamp) < this.CACHE_DURATION) {
        console.log('🔍 Returning sites from cache');
        return this.sitesCache.data;
      }

      console.log('🔍 Fetching sites from database...');
      
      // Check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return [];
      }
      
      if (!session) {
        console.error('❌ No active session');
        return [];
      }
      
      console.log('🔍 Making simple Supabase query...');
      
      // Query to get sites with user assignments and organization data
      const { data, error } = await supabase
        .from('sites')
        .select(`
          *,
          assigned_ops_manager_profile:profiles!assigned_ops_manager_id(full_name),
          assigned_deployment_engineer_profile:profiles!assigned_deployment_engineer_id(full_name),
          organization:organizations(name, logo_url)
        `)
        .order('name');

      if (error) {
        console.error('❌ Error fetching sites:', error);
        return [];
      }

      console.log('🔍 Sites fetched successfully:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('⚠️ No sites found in database');
        return [];
      }

             // Transform the data to match our Site interface
       const transformedSites = data.map((site: any) => {
         return {
           id: site.id,
           name: site.name || 'Unnamed Site',
           organization_id: site.organization_id || '',
           organization_name: site.organization?.name || 'Organization',
           organization_logo: site.organization?.logo_url || null,
           location: site.address || site.location || 'Location not specified',
           status: site.workflow_status || site.status || 'Unknown',
           target_live_date: site.suggested_go_live || site.target_go_live || '', // Show suggested go-live as target
           suggested_go_live: site.suggested_go_live || site.target_go_live || '',
           assigned_ops_manager: site.assigned_ops_manager_profile?.full_name || 'Unassigned',
           assigned_deployment_engineer: site.assigned_deployment_engineer_profile?.full_name || 'Unassigned',
           sector: site.sector || '',
           unit_code: site.unit_code || site.food_court_unit || '',
           criticality_level: site.criticality_level || 'medium',
           team_assignment: site.team_assignment || '',
           stakeholders: site.stakeholders || [],
           notes: site.description || site.notes || '',
           // Contact information fields
           unitManagerName: site.unit_manager_name || '',
           jobTitle: site.job_title || '',
           unitManagerEmail: site.unit_manager_email || '',
           unitManagerMobile: site.unit_manager_mobile || '',
           additionalContactName: site.additional_contact_name || '',
           additionalContactEmail: site.additional_contact_email || '',
           // Location fields
           latitude: site.latitude || null,
           longitude: site.longitude || null,
           postcode: site.postcode || '',
           region: site.region || '',
           country: site.country || '',
           created_at: site.created_at || new Date().toISOString(),
           updated_at: site.updated_at || new Date().toISOString()
         } as Site;
       });

      // Update cache
      this.sitesCache = {
        data: transformedSites,
        timestamp: Date.now()
      };

      console.log('✅ Sites transformed and cached successfully:', transformedSites.length);
      return transformedSites;
    } catch (error) {
      console.error('❌ Error in getAllSites:', error);
      return [];
    }
  }

  // Get site by ID with user assignments
  static async getSiteById(siteId: string): Promise<Site | null> {
    try {
      console.log('🔍 Fetching site by ID:', siteId);
      
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error) {
        console.error('❌ Error fetching site:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ No site found with ID:', siteId);
        return null;
      }

      console.log('🔍 Raw site data:', data);

      const transformedSite: any = {
        id: data.id,
        name: data.name || 'Unnamed Site',
        organization_id: data.organization_id || '',
        organization_name: data.organization_name || 'Organization',
        organization_logo: data.organization_logo || null,
        location: data.location || 'Location not specified',
        status: data.status || 'Unknown',
        target_live_date: data.target_live_date || '',
        assigned_ops_manager: data.assigned_ops_manager || 'Unassigned',
        assigned_deployment_engineer: data.assigned_deployment_engineer || 'Unassigned',
        sector: data.sector || '',
        unit_code: data.unit_code || data.food_court_unit || '',
        criticality_level: data.criticality_level || 'medium',
        team_assignment: data.team_assignment || '',
        stakeholders: data.stakeholders || [],
        notes: data.description || '',
        // Contact information fields
        unitManagerName: data.unit_manager_name || '',
        jobTitle: data.job_title || '',
        unitManagerEmail: data.unit_manager_email || '',
        unitManagerMobile: data.unit_manager_mobile || '',
        additionalContactName: data.additional_contact_name || '',
        additionalContactEmail: data.additional_contact_email || '',
        // Location fields
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        postcode: data.postcode || '',
        region: data.region || '',
        country: data.country || '',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };
      
      return transformedSite;
    } catch (error) {
      console.error('❌ Error in getSiteById:', error);
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

  // Get all organizations with sites count
  static async getAllOrganizations(): Promise<Organization[]> {
    try {
      // First get all organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        return [];
      }

      if (!organizations || organizations.length === 0) {
        return [];
      }

      // Get sites count for each organization
      const organizationsWithCount = await Promise.all(
        organizations.map(async (org) => {
          const { count, error: countError } = await supabase
            .from('sites')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);

          if (countError) {
            console.warn(`Error counting sites for organization ${org.name}:`, countError);
            return { ...org, sites_count: 0 };
          }

          return { ...org, sites_count: count || 0 };
        })
      );

      return organizationsWithCount;
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

  // Get all users for assignment purposes
  static async getAllUsers(): Promise<Array<{ user_id: string; full_name: string; email: string; role: string }>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          user_roles (
            role
          )
        `)
        .order('full_name');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      // Transform the data to flatten the roles
      return data?.map((user: any) => ({
        user_id: user.user_id,
        full_name: user.full_name || user.email,
        email: user.email,
        role: user.user_roles?.[0]?.role || 'user'
      })) || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  // Assign users to a site
  static async assignUsersToSite(
    siteId: string, 
    opsManagerId: string | null, 
    deploymentEngineerId: string | null
  ): Promise<boolean> {
    try {
      // First, update the site table
      const { error: siteError } = await supabase
        .from('sites')
        .update({
          assigned_ops_manager_id: opsManagerId,
          assigned_deployment_engineer_id: deploymentEngineerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (siteError) {
        console.error('Error updating site assignments:', siteError);
        return false;
      }

      // Then, update or insert into site_assignments table
      const { error: assignmentError } = await supabase
        .from('site_assignments')
        .upsert({
          site_id: siteId,
          ops_manager_id: opsManagerId,
          deployment_engineer_id: deploymentEngineerId,
          assigned_by: 'system', // This should be the current user's ID in a real app
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'site_id'
        });

      if (assignmentError) {
        console.error('Error updating site assignments:', assignmentError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignUsersToSite:', error);
      return false;
    }
  }

  // Clear cache when data is modified
  static clearCache(): void {
    this.sitesCache = null;
    console.log('🔍 Sites cache cleared');
  }
}
