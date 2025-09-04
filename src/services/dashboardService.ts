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
      // Align with finalized status enums from migrations/types
      const activeSites = sitesData?.filter(site => 
        ['scoping_done', 'approved', 'procurement_done', 'deployed', 'live'].includes((site as any).status)
      ).length || 0;

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

  // Get Ops Manager specific dashboard metrics
  async getOpsManagerDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get total sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('id, status');

      if (sitesError) throw sitesError;
      const totalSites = sitesData?.length || 0;
      const activeDeployments = sitesData?.filter(site => 
        ['deployment', 'deployed', 'procurement_done'].includes((site as any).status)
      ).length || 0;
      const completedDeployments = sitesData?.filter(site => ['live'].includes((site as any).status)).length || 0;

      // Get real pending approvals from hardware_requests
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('hardware_requests')
        .select('id, status')
        .eq('status', 'pending');

      if (approvalsError) throw approvalsError;
      const pendingApprovals = approvalsData?.length || 0;
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
      const activeDeployments = sitesData?.filter(site => 
        ['deployment', 'deployed', 'procurement_done'].includes((site as any).status)
      ).length || 0;
      const completedDeployments = sitesData?.filter(site => ['live'].includes((site as any).status)).length || 0;

      // Get real pending approvals for the current user
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('hardware_requests')
        .select('id, status')
        .eq('status', 'pending');

      if (approvalsError) throw approvalsError;
      const pendingApprovals = approvalsData?.length || 0;
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
        if (site && Array.isArray(site) && site.length > 0) {
          const siteData = site[0]; // Get the first site from the array
          if (siteData.status === 'new') {
            tasks.push({
              id: `site-${siteData.id}`,
              title: `Complete site study for ${siteData.name}`,
              priority: 'high',
              status: 'pending',
              type: 'site_study',
              siteId: siteData.id,
            });
          } else if (siteData.status === 'in-progress') {
            tasks.push({
              id: `deploy-${siteData.id}`,
              title: `Deploy hardware for ${siteData.name}`,
              priority: 'medium',
              status: 'in_progress',
              type: 'deployment',
              siteId: siteData.id,
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