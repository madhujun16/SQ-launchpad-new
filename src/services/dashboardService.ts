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

      // Get total inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, status');

      if (inventoryError) throw inventoryError;
      const totalInventory = inventoryData?.length || 0;
      const availableInventory = inventoryData?.filter(item => item.status === 'available').length || 0;
      const deployedInventory = inventoryData?.filter(item => item.status === 'deployed').length || 0;

      // Get total licenses
      const { data: licensesData, error: licensesError } = await supabase
        .from('licenses')
        .select('id, status, expiry_date');

      if (licensesError) throw licensesError;
      const totalLicenses = licensesData?.length || 0;
      const activeLicenses = licensesData?.filter(license => license.status === 'active').length || 0;
      
      // Count expiring licenses (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringLicenses = licensesData?.filter(license => {
        if (!license.expiry_date) return false;
        const expiryDate = new Date(license.expiry_date);
        return expiryDate <= thirtyDaysFromNow && license.status === 'active';
      }).length || 0;

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

  // Get recent inventory items
  async getRecentInventoryItems(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          serial_number,
          model,
          inventory_type,
          group_type,
          status,
          created_at,
          site:sites(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent inventory items:', error);
      throw error;
    }
  },

  // Get recent licenses
  async getRecentLicenses(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select(`
          id,
          name,
          license_type,
          vendor,
          status,
          expiry_date,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent licenses:', error);
      throw error;
    }
  },

  // Get alerts (licenses expiring soon, low inventory, etc.)
  async getAlerts() {
    try {
      const alerts = [];

      // Check for licenses expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data: expiringLicenses, error: licensesError } = await supabase
        .from('licenses')
        .select('name, expiry_date')
        .eq('status', 'active')
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      if (!licensesError && expiringLicenses?.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Licenses Expiring Soon',
          message: `${expiringLicenses.length} license(s) will expire within 30 days`,
          count: expiringLicenses.length,
        });
      }

      // Check for low inventory (less than 3 available items)
      const { data: availableInventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('status', 'available');

      if (!inventoryError && availableInventory && availableInventory.length < 3) {
        alerts.push({
          type: 'warning',
          title: 'Low Inventory',
          message: `Only ${availableInventory.length} items available in inventory`,
          count: availableInventory.length,
        });
      }

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