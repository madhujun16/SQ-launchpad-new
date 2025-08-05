import { supabase } from '@/integrations/supabase/client';

// Types for dashboard metrics
export interface DashboardMetrics {
  totalSites: number;
  activeDeployments: number;
  pendingApprovals: number;
  completedDeployments: number;
  averageDeploymentTime: number;
  customerSatisfaction: number;
}

export interface TaskQueueItem {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  dueDate: string;
  siteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExceptionAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  assignedTo: string;
  isRead: boolean;
  createdAt: string;
}

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

  // Get Ops Manager specific dashboard metrics
  async getOpsManagerDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get total sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, status');

      if (sitesError) throw sitesError;
      const totalSites = sitesData?.length || 0;
      const activeDeployments = sitesData?.filter(site => site.status === 'in-progress').length || 0;
      const completedDeployments = sitesData?.filter(site => site.status === 'completed').length || 0;

      // Mock data for pending approvals (in real app, this would come from a workflow table)
      const pendingApprovals = 3; // Mock value
      const averageDeploymentTime = 12; // Mock value in days
      const customerSatisfaction = 4.8; // Mock value

      return {
        totalSites,
        activeDeployments,
        pendingApprovals,
        completedDeployments,
        averageDeploymentTime,
        customerSatisfaction,
      };
    } catch (error) {
      console.error('Error fetching Ops Manager dashboard metrics:', error);
      // Return mock data on error
      return {
        totalSites: 24,
        activeDeployments: 8,
        pendingApprovals: 3,
        completedDeployments: 13,
        averageDeploymentTime: 12,
        customerSatisfaction: 4.8,
      };
    }
  },

  // Get task queue items for Ops Manager
  async getTaskQueueItems(): Promise<TaskQueueItem[]> {
    try {
      // In a real app, this would query a task queue table
      // For now, return mock data
      return [
        {
          id: '1',
          title: 'Approve Hardware Request',
          description: 'Review and approve hardware specifications for Tesco Birmingham',
          type: 'approval',
          priority: 'high',
          status: 'pending',
          assignedTo: 'ops_manager',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          siteId: 'site-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Review Site Study',
          description: 'Review completed site study for ASDA Coventry',
          type: 'approval',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'ops_manager',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          siteId: 'site-002',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Error fetching task queue items:', error);
      return [];
    }
  },

  // Get exception alerts for Ops Manager
  async getExceptionAlerts(): Promise<ExceptionAlert[]> {
    try {
      // In a real app, this would query an alerts table
      // For now, return mock data
      return [
        {
          id: '1',
          type: 'approval_overdue',
          severity: 'high',
          title: 'Hardware Approval Overdue',
          message: 'Hardware request for Tesco Birmingham has been pending for 5 days',
          entityType: 'hardware_request',
          entityId: 'hw-001',
          assignedTo: 'ops_manager',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'deployment_delay',
          severity: 'medium',
          title: 'Site Study Delayed',
          message: 'Site study for ASDA Coventry is 2 days behind schedule',
          entityType: 'site_study',
          entityId: 'study-001',
          assignedTo: 'ops_manager',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Error fetching exception alerts:', error);
      return [];
    }
  },

  // Get Deployment Engineer specific dashboard metrics
  async getDeploymentEngineerDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get total sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, status');

      if (sitesError) throw sitesError;
      const totalSites = sitesData?.length || 0;
      const activeDeployments = sitesData?.filter(site => site.status === 'in-progress').length || 0;
      const completedDeployments = sitesData?.filter(site => site.status === 'completed').length || 0;

      // Mock data for pending approvals and other metrics
      const pendingApprovals = 2; // Mock value
      const averageDeploymentTime = 10; // Mock value in days
      const customerSatisfaction = 4.9; // Mock value

      return {
        totalSites,
        activeDeployments,
        pendingApprovals,
        completedDeployments,
        averageDeploymentTime,
        customerSatisfaction,
      };
    } catch (error) {
      console.error('Error fetching Deployment Engineer dashboard metrics:', error);
      // Return mock data on error
      return {
        totalSites: 18,
        activeDeployments: 6,
        pendingApprovals: 2,
        completedDeployments: 10,
        averageDeploymentTime: 10,
        customerSatisfaction: 4.9,
      };
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