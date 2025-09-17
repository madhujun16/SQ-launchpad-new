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
  unit_code?: string;
  logo_url?: string;
  description?: string;
  sites_count?: number; // Number of sites mapped to this organization
  is_archived?: boolean;
  archived_at?: string;
  archive_reason?: string;
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
      
      // Check if we have an active session with retry logic
      let session = null;
      let sessionError = null;
      
      try {
        // Try to get session with a reasonable timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 15000) // Increased to 15 seconds
          )
        ]);
        
        if (sessionResult && typeof sessionResult === 'object' && 'data' in sessionResult) {
          session = (sessionResult as any).data.session;
          sessionError = (sessionResult as any).error;
        }
      } catch (error) {
        console.warn('⚠️ Session check failed, attempting refresh:', error);
        
        // Wait a bit before attempting refresh to avoid lock conflicts
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to refresh the session with better error handling
        try {
          const refreshResult = await Promise.race([
            supabase.auth.refreshSession(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session refresh timeout')), 25000) // Increased to 25 seconds
            )
          ]);
          
          if (refreshResult && typeof refreshResult === 'object' && 'data' in refreshResult) {
            session = (refreshResult as any).data.session;
            sessionError = (refreshResult as any).error;
            console.log('✅ Session refreshed successfully');
          }
        } catch (refreshError) {
          console.error('❌ Session refresh failed:', refreshError);
          
          // If we have cached data, return it instead of empty array
          if (this.sitesCache) {
            console.log('🔍 Returning stale cache due to session issues');
            return this.sitesCache.data;
          }
          
          // If no cache, try one more time with a simple session check
          try {
            console.log('🔄 Attempting final session check...');
            const finalSessionResult = await supabase.auth.getSession();
            if (finalSessionResult.data.session) {
              session = finalSessionResult.data.session;
              sessionError = finalSessionResult.error;
              console.log('✅ Final session check succeeded');
            } else {
              console.log('❌ No session available, returning empty array');
              return [];
            }
          } catch (finalError) {
            console.error('❌ Final session check failed:', finalError);
            return [];
          }
        }
      }
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        // Return cached data if available, otherwise empty array
        if (this.sitesCache) {
          console.log('🔍 Returning stale cache due to session error');
          return this.sitesCache.data;
        }
        return [];
      }
      
      if (!session) {
        console.error('❌ No active session');
        // Return cached data if available, otherwise empty array
        if (this.sitesCache) {
          console.log('🔍 Returning stale cache due to no session');
          return this.sitesCache.data;
        }
        return [];
      }
      
      console.log('🔍 Making Supabase query with organization join...');
      
      // Query to get sites with organization data - only non-archived sites
      // Add timeout to the query itself
      const queryPromise = supabase
        .from('sites')
        .select(`
          *,
          organization:organizations(id, name, logo_url, sector, unit_code)
        `)
        .eq('is_archived', false)
        .order('name');

      const { data, error } = await Promise.race([
        queryPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 25000)
        )
      ]) as any;

      if (error) {
        console.error('❌ Error fetching sites:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Return cached data if available, otherwise empty array
        if (this.sitesCache) {
          console.log('🔍 Returning stale cache due to query error');
          return this.sitesCache.data;
        }
        return [];
      }

      console.log('🔍 Sites fetched successfully:', data?.length || 0);
      console.log('🔍 Raw data sample:', data?.[0] ? {
        id: data[0].id,
        name: data[0].name,
        organization: data[0].organization,
        status: data[0].status,
        address: data[0].address
      } : 'No data');

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
          organization_name: site.organization?.name || site.organization_name || 'Unknown Organization',
          organization_logo: site.organization?.logo_url || site.organization_logo || null,
          location: site.address || site.location || 'Location not specified',
          status: site.status || 'Unknown',
          target_live_date: site.target_live_date || '',
          suggested_go_live: site.target_live_date || '', // Using target_live_date as suggested go-live
          assigned_ops_manager: site.assigned_ops_manager || 'Unassigned',
          assigned_deployment_engineer: site.assigned_deployment_engineer || 'Unassigned',
          sector: site.organization?.sector || site.sector || 'Unknown Sector',
          unit_code: site.organization?.unit_code || site.unit_code || site.food_court_unit || '',
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
      
      // Return cached data if available, otherwise empty array
      if (this.sitesCache) {
        console.log('🔍 Returning stale cache due to general error');
        return this.sitesCache.data;
      }
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
        .eq('is_archived', false)
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
        organization_name: 'Organization', // Would need to join with organizations table
        organization_logo: null,
        location: data.address || 'Location not specified',
        status: data.status || 'Unknown',
        target_live_date: data.target_live_date || '',
        suggested_go_live: data.target_live_date || '',
        assigned_ops_manager: data.assigned_ops_manager || 'Unassigned',
        assigned_deployment_engineer: data.assigned_deployment_engineer || 'Unassigned',
        sector: 'Unknown Sector',
        unit_code: data.unit_code || '',
        criticality_level: 'medium', // Default value since not in schema
        team_assignment: '',
        stakeholders: [],
        notes: data.description || '',
        // Contact information fields - not in current schema, using defaults
        unitManagerName: '',
        jobTitle: '',
        unitManagerEmail: '',
        unitManagerMobile: '',
        additionalContactName: '',
        additionalContactEmail: '',
        // Location fields
        latitude: null,
        longitude: null,
        postcode: data.postcode || '',
        region: '',
        country: '',
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
        .eq('is_archived', false)
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
        .eq('is_archived', false)
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
        .eq('is_archived', false)
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

  // Get all organizations with sites count (including archived)
  static async getAllOrganizations(): Promise<Organization[]> {
    try {
      // Get all organizations with a single query
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

      // Get site counts for all organizations in a single aggregated query
      const { data: siteCounts, error: siteCountsError } = await supabase
        .from('sites')
        .select('organization_id')
        .eq('is_archived', false);

      if (siteCountsError) {
        console.error('Error fetching site counts:', siteCountsError);
        // Return organizations without site counts if the query fails
        return organizations.map(org => ({ ...org, sites_count: 0 }));
      }

      // Create a map of organization_id -> site count
      const siteCountMap = new Map<string, number>();
      if (siteCounts) {
        siteCounts.forEach(site => {
          const orgId = site.organization_id;
          if (orgId) {
            siteCountMap.set(orgId, (siteCountMap.get(orgId) || 0) + 1);
          }
        });
      }

      // Transform organizations with their site counts
      const organizationsWithCounts = organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        sector: org.sector || '',
        unit_code: org.unit_code || '',
        logo_url: org.logo_url || null,
        description: org.description || '',
        created_at: org.created_at || '',
        updated_at: org.updated_at || '',
        is_archived: org.is_archived || false,
        archived_at: org.archived_at || null,
        archive_reason: org.archive_reason || null,
        sites_count: siteCountMap.get(org.id) || 0
      }));

      return organizationsWithCounts;
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

  // Archive site (soft delete)
  static async archiveSite(siteId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archive_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error archiving site:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in archiveSite:', error);
      return false;
    }
  }

  // Unarchive site
  static async unarchiveSite(siteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          is_archived: false,
          archived_at: null,
          archive_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId);

      if (error) {
        console.error('Error unarchiving site:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unarchiveSite:', error);
      return false;
    }
  }

  // Delete site (hard delete - use with caution)
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
