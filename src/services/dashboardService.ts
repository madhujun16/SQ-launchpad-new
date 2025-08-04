import { supabase } from '@/integrations/supabase/client';

// Cache for dashboard metrics to avoid repeated API calls
const metricsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch fresh data
const getCachedOrFetch = async (key: string, fetchFunction: () => Promise<any>) => {
  const cached = metricsCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  metricsCache.set(key, { data, timestamp: now });
  return data;
};

export interface DashboardMetrics {
  totalSites?: number;
  sitesInProgress?: number;
  sitesLive?: number;
  pendingApprovals?: number;
  totalActiveLicenses?: number;
  averageDeploymentTime?: number;
  sitesUnderManagement?: number;
  hardwareRequestsPending?: number;
  inventoryAssignmentPending?: number;
  sitesScheduled?: number;
  sitesCompleted?: number;
  assetsInStock?: number;
  assetsInMaintenance?: number;
  assetsRetired?: number;
  averageApprovalTime?: number;
  assignedSites?: number;
  siteStudiesInProgress?: number;
  hardwareScopingCompleted?: number;
  procurementRequested?: number;
  procurementApproved?: number;
  procurementDispatched?: number;
  deploymentScheduled?: number;
  deploymentInProgress?: number;
  deploymentLive?: number;
  averageDeploymentTimePerSite?: number;
}

export interface TaskQueueItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  dueDate?: string;
  type: string;
}

export interface ExceptionAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  type: string;
}

// Optimized Admin Dashboard Metrics
export const getAdminDashboardMetrics = async (): Promise<DashboardMetrics> => {
  return getCachedOrFetch('admin-metrics', async () => {
    try {
      // Parallel queries for better performance
      const [
        { count: totalSites },
        { count: sitesInProgress },
        { count: sitesLive },
        { count: pendingApprovals },
        { count: totalActiveLicenses }
      ] = await Promise.all([
        supabase.from('sites').select('*', { count: 'exact', head: true }),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('hardware_request').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('licenses').select('*', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      // Calculate average deployment time using site study start date
      const { data: sitesWithStudyDates } = await supabase
        .from('site_studies')
        .select(`
          study_date,
          site_id,
          sites!inner(
            activation_date
          )
        `)
        .not('study_date', 'is', null)
        .not('sites.activation_date', 'is', null);

      let averageDeploymentTime = 0;
      if (sitesWithStudyDates && sitesWithStudyDates.length > 0) {
        const totalDays = sitesWithStudyDates.reduce((acc, siteStudy) => {
          const activation = new Date(siteStudy.sites.activation_date);
          const studyStart = new Date(siteStudy.study_date);
          return acc + Math.ceil((activation.getTime() - studyStart.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        averageDeploymentTime = totalDays / sitesWithStudyDates.length;
      }

      return {
        totalSites: totalSites || 0,
        sitesInProgress: sitesInProgress || 0,
        sitesLive: sitesLive || 0,
        pendingApprovals: pendingApprovals || 0,
        totalActiveLicenses: totalActiveLicenses || 0,
        averageDeploymentTime: Math.round(averageDeploymentTime)
      };
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
      return {
        totalSites: 0,
        sitesInProgress: 0,
        sitesLive: 0,
        pendingApprovals: 0,
        totalActiveLicenses: 0,
        averageDeploymentTime: 0
      };
    }
  });
};

// Optimized Ops Manager Dashboard Metrics
export const getOpsManagerDashboardMetrics = async (userId: string): Promise<DashboardMetrics> => {
  return getCachedOrFetch(`ops-manager-${userId}`, async () => {
    try {
      // Get assigned sites for the user
      const { data: assignedSites } = await supabase
        .from('sites')
        .select('*')
        .eq('ops_manager_id', userId);

      const siteIds = assignedSites?.map(site => site.id) || [];

      // Parallel queries for better performance
      const [
        { count: hardwareRequestsPending },
        { count: inventoryAssignmentPending },
        { count: sitesScheduled },
        { count: sitesInProgress },
        { count: sitesLive }
      ] = await Promise.all([
        supabase.from('hardware_request').select('*', { count: 'exact', head: true }).eq('status', 'pending').in('site_id', siteIds),
        supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('assignment_status', 'pending'),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'scheduled').in('id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'in-progress').in('id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'completed').in('id', siteIds)
      ]);

      return {
        sitesUnderManagement: assignedSites?.length || 0,
        hardwareRequestsPending: hardwareRequestsPending || 0,
        inventoryAssignmentPending: inventoryAssignmentPending || 0,
        sitesScheduled: sitesScheduled || 0,
        sitesInProgress: sitesInProgress || 0,
        sitesLive: sitesLive || 0
      };
    } catch (error) {
      console.error('Error fetching ops manager dashboard metrics:', error);
      return {
        sitesUnderManagement: 0,
        hardwareRequestsPending: 0,
        inventoryAssignmentPending: 0,
        sitesScheduled: 0,
        sitesInProgress: 0,
        sitesLive: 0
      };
    }
  });
};

// Optimized Deployment Engineer Dashboard Metrics
export const getDeploymentEngineerDashboardMetrics = async (userId: string): Promise<DashboardMetrics> => {
  return getCachedOrFetch(`deployment-engineer-${userId}`, async () => {
    try {
      // Get assigned sites for the user
      const { data: assignedSites } = await supabase
        .from('sites')
        .select('*')
        .eq('deployment_engineer_id', userId);

      const siteIds = assignedSites?.map(site => site.id) || [];

      // Parallel queries for better performance
      const [
        { count: siteStudiesInProgress },
        { count: hardwareScopingCompleted },
        { count: procurementRequested },
        { count: procurementApproved },
        { count: procurementDispatched },
        { count: deploymentScheduled },
        { count: deploymentInProgress },
        { count: deploymentLive }
      ] = await Promise.all([
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('study_status', 'in-progress').in('id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('hardware_scoping_status', 'completed').in('id', siteIds),
        supabase.from('procurement').select('*', { count: 'exact', head: true }).eq('status', 'requested').in('site_id', siteIds),
        supabase.from('procurement').select('*', { count: 'exact', head: true }).eq('status', 'approved').in('site_id', siteIds),
        supabase.from('procurement').select('*', { count: 'exact', head: true }).eq('status', 'dispatched').in('site_id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'scheduled').in('id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'in-progress').in('id', siteIds),
        supabase.from('sites').select('*', { count: 'exact', head: true }).eq('deployment_status', 'completed').in('id', siteIds)
      ]);

      // Calculate average deployment time per site using site study start date
      const { data: userSitesWithStudyDates } = await supabase
        .from('site_studies')
        .select(`
          study_date,
          site_id,
          sites!inner(
            activation_date
          )
        `)
        .not('study_date', 'is', null)
        .not('sites.activation_date', 'is', null)
        .in('site_id', siteIds);

      let averageDeploymentTimePerSite = 0;
      if (userSitesWithStudyDates && userSitesWithStudyDates.length > 0) {
        const totalDays = userSitesWithStudyDates.reduce((acc, siteStudy) => {
          const activation = new Date(siteStudy.sites.activation_date);
          const studyStart = new Date(siteStudy.study_date);
          return acc + Math.ceil((activation.getTime() - studyStart.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        averageDeploymentTimePerSite = totalDays / userSitesWithStudyDates.length;
      }

      return {
        assignedSites: assignedSites?.length || 0,
        siteStudiesInProgress: siteStudiesInProgress || 0,
        hardwareScopingCompleted: hardwareScopingCompleted || 0,
        procurementRequested: procurementRequested || 0,
        procurementApproved: procurementApproved || 0,
        procurementDispatched: procurementDispatched || 0,
        deploymentScheduled: deploymentScheduled || 0,
        deploymentInProgress: deploymentInProgress || 0,
        deploymentLive: deploymentLive || 0,
        averageDeploymentTimePerSite: Math.round(averageDeploymentTimePerSite)
      };
    } catch (error) {
      console.error('Error fetching deployment engineer dashboard metrics:', error);
      return {
        assignedSites: 0,
        siteStudiesInProgress: 0,
        hardwareScopingCompleted: 0,
        procurementRequested: 0,
        procurementApproved: 0,
        procurementDispatched: 0,
        deploymentScheduled: 0,
        deploymentInProgress: 0,
        deploymentLive: 0,
        averageDeploymentTimePerSite: 0
      };
    }
  });
};

// Clear cache when needed (e.g., after data updates)
export const clearDashboardCache = () => {
  metricsCache.clear();
};

// Get task queue items
export const getTaskQueueItems = async (role: string, userId?: string): Promise<TaskQueueItem[]> => {
  // Mock data for now - can be replaced with actual API calls
  return [
    {
      id: '1',
      title: 'Hardware approval required',
      description: 'Birmingham Office Cafeteria needs hardware approval',
      priority: 'high',
      status: 'pending',
      assignee: 'Mike Thompson',
      dueDate: '2025-01-15',
      type: 'approval'
    },
    {
      id: '2',
      title: 'Site study completion',
      description: 'Manchester Central site study needs final review',
      priority: 'medium',
      status: 'in-progress',
      assignee: 'Sarah Johnson',
      dueDate: '2025-01-20',
      type: 'study'
    }
  ];
};

// Get exception alerts
export const getExceptionAlerts = async (role: string, userId?: string): Promise<ExceptionAlert[]> => {
  // Mock data for now - can be replaced with actual API calls
  return [
    {
      id: '1',
      title: 'Overdue deployment',
      description: 'Liverpool Business Park deployment is overdue by 3 days',
      severity: 'high',
      timestamp: '2025-01-10T10:30:00Z',
      type: 'deployment'
    },
    {
      id: '2',
      title: 'Hardware shortage',
      description: 'Insufficient POS terminals in inventory',
      severity: 'medium',
      timestamp: '2025-01-10T09:15:00Z',
      type: 'inventory'
    }
  ];
}; 