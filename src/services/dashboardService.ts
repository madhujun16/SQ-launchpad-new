import { supabase } from '@/integrations/supabase/client';

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      // Get total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) throw usersError;
      const totalUsers = usersData?.length || 0;

      // Get total sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, status');

      if (sitesError) throw sitesError;
      const totalSites = sitesData?.length || 0;
      const activeSites = sitesData?.filter(site => site.status === 'active').length || 0;

      // Mock data for inventory_items and licenses (tables not in schema)
      const totalInventory = 0;
      const availableInventory = 0;
      const deployedInventory = 0;
      const totalLicenses = 0;
      const activeLicenses = 0;
      const expiringLicenses = 0;

      return {
        totalUsers,
        totalSites,
        activeSites,
        totalInventory,
        availableInventory,
        deployedInventory,
        totalLicenses,
        activeLicenses,
        expiringLicenses,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent sites
  async getRecentSites(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select(`
          id,
          name,
          food_court_unit,
          status,
          created_at,
          sector:sectors(name),
          city:cities(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent sites:', error);
      throw error;
    }
  },

  // Get recent inventory items - mock implementation
  async getRecentInventoryItems(limit = 5) {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching recent inventory items:', error);
      throw error;
    }
  },

  // Get recent licenses - mock implementation
  async getRecentLicenses(limit = 5) {
    try {
      return [];
    } catch (error) {
      console.error('Error fetching recent licenses:', error);
      throw error;
    }
  },

  // Get alerts - mock implementation since tables don't exist
  async getAlerts() {
    try {
      const alerts = [];

      // Check for sites in progress
      const { data: inProgressSites, error: sitesError } = await supabase
        .from('sites')
        .select('name')
        .eq('status', 'in-progress');

      if (!sitesError && inProgressSites?.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Sites In Progress',
          message: `${inProgressSites.length} site(s) are currently being deployed`,
          count: inProgressSites.length,
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  // Get tasks for the current user
  async getUserTasks(userId: string) {
    try {
      // Get sites assigned to the user
      const { data: assignedSites, error: sitesError } = await supabase
        .from('site_assignments')
        .select(`
          site:sites(
            id,
            name,
            status
          )
        `)
        .or(`ops_manager_id.eq.${userId},deployment_engineer_id.eq.${userId}`);

      if (sitesError) throw sitesError;

      const tasks = [];

      // Create tasks based on assigned sites
      assignedSites?.forEach((assignment) => {
        const site = assignment.site;
        if (site) {
          if (site.status === 'new') {
            tasks.push({
              id: `site-${site.id}`,
              title: `Complete site study for ${site.name}`,
              priority: 'high',
              status: 'pending',
              type: 'site_study',
              siteId: site.id,
            });
          } else if (site.status === 'in-progress') {
            tasks.push({
              id: `deploy-${site.id}`,
              title: `Deploy hardware for ${site.name}`,
              priority: 'medium',
              status: 'in_progress',
              type: 'deployment',
              siteId: site.id,
            });
          }
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  },
};