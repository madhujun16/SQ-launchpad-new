import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  // Admin Dashboard Metrics
  totalSites?: number;
  sitesInProgress?: number;
  pendingApprovals?: number;
  totalActiveSites?: number;
  totalActiveLicenses?: number;
  averageDeploymentTime?: number;
  

  
  // Finance Metrics
  procurementSpend?: number;
  assetDepreciation?: number;
  
  // Ops Manager Metrics
  sitesUnderManagement?: number;
  hardwareRequestsPending?: number;
  inventoryAssignmentPending?: number;
  sitesScheduled?: number;
  sitesInProgress?: number;
  sitesLive?: number;
  assetsInMaintenance?: number;
  averageApprovalTime?: number;
  
  // Deployment Engineer Metrics
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
  priority: 'high' | 'medium' | 'low';
  status: string;
  dueDate?: string;
  assignee?: string;
  type: string;
}

export interface AuditLogEntry {
  id: string;
  entity: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface ExceptionAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  timestamp: string;
}

export class DashboardService {
  // Admin Dashboard Methods
  static async getAdminDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get total sites
      const { count: totalSites } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });

      // Get sites in progress
      const { count: sitesInProgress } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('study_status', 'In Progress');

      // Get pending approvals (hardware requests)
      const { count: pendingApprovals } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('cost_approval_status', 'Pending');

      // Get active sites
      const { count: totalActiveSites } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      // Get active licenses
      const { count: totalActiveLicenses } = await supabase
        .from('licenses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');



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
        averageDeploymentTime = Math.round(totalDays / sitesWithStudyDates.length);
      }

      return {
        totalSites: totalSites || 0,
        sitesInProgress: sitesInProgress || 0,
        pendingApprovals: pendingApprovals || 0,
        totalActiveSites: totalActiveSites || 0,
        totalActiveLicenses: totalActiveLicenses || 0,
        averageDeploymentTime,
        procurementSpend: 0, // TODO: Implement when procurement table is available
        assetDepreciation: 0 // TODO: Implement when depreciation tracking is available
      };
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
      return {};
    }
  }

  // Ops Manager Dashboard Methods
  static async getOpsManagerDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    try {
      // Get sites assigned to user
      const { data: assignedSites } = await supabase
        .from('sites')
        .select('*')
        .eq('ops_manager_id', userId);

      const sitesUnderManagement = assignedSites?.length || 0;

      // Get hardware requests pending approval
      const { count: hardwareRequestsPending } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('cost_approval_status', 'Pending')
        .in('id', assignedSites?.map(site => site.id) || []);

      // Get inventory assignment pending
      const { count: inventoryAssignmentPending } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      // Get deployment status counts
      const { count: sitesScheduled } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'Scheduled')
        .in('id', assignedSites?.map(site => site.id) || []);

      const { count: sitesInProgress } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'In Progress')
        .in('id', assignedSites?.map(site => site.id) || []);

      const { count: sitesLive } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'Completed')
        .in('id', assignedSites?.map(site => site.id) || []);

      // Get assets in maintenance
      const { count: assetsInMaintenance } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'maintenance');

      return {
        sitesUnderManagement,
        hardwareRequestsPending: hardwareRequestsPending || 0,
        inventoryAssignmentPending: inventoryAssignmentPending || 0,
        sitesScheduled: sitesScheduled || 0,
        sitesInProgress: sitesInProgress || 0,
        sitesLive: sitesLive || 0,
        assetsInMaintenance: assetsInMaintenance || 0,
        averageApprovalTime: 0 // TODO: Implement when approval tracking is available
      };
    } catch (error) {
      console.error('Error fetching ops manager dashboard metrics:', error);
      return {};
    }
  }

  // Deployment Engineer Dashboard Methods
  static async getDeploymentEngineerDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    try {
      // Get sites assigned to user
      const { data: assignedSites } = await supabase
        .from('sites')
        .select('*')
        .eq('deployment_engineer_id', userId);

      const assignedSitesCount = assignedSites?.length || 0;

      // Get site studies in progress
      const { count: siteStudiesInProgress } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('study_status', 'In Progress')
        .in('id', assignedSites?.map(site => site.id) || []);

      // Get hardware scoping completed
      const { count: hardwareScopingCompleted } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('hardware_scoping_status', 'Completed')
        .in('id', assignedSites?.map(site => site.id) || []);

      // Get deployment status counts
      const { count: deploymentScheduled } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'Scheduled')
        .in('id', assignedSites?.map(site => site.id) || []);

      const { count: deploymentInProgress } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'In Progress')
        .in('id', assignedSites?.map(site => site.id) || []);

      const { count: deploymentLive } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true })
        .eq('deployment_status', 'Completed')
        .in('id', assignedSites?.map(site => site.id) || []);

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
        .in('site_id', assignedSites?.map(site => site.id) || []);

      let averageDeploymentTimePerSite = 0;
      if (userSitesWithStudyDates && userSitesWithStudyDates.length > 0) {
        const totalDays = userSitesWithStudyDates.reduce((acc, siteStudy) => {
          const activation = new Date(siteStudy.sites.activation_date);
          const studyStart = new Date(siteStudy.study_date);
          return acc + Math.ceil((activation.getTime() - studyStart.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);
        averageDeploymentTimePerSite = Math.round(totalDays / userSitesWithStudyDates.length);
      }

      return {
        assignedSites: assignedSitesCount,
        siteStudiesInProgress: siteStudiesInProgress || 0,
        hardwareScopingCompleted: hardwareScopingCompleted || 0,
        deploymentScheduled: deploymentScheduled || 0,
        deploymentInProgress: deploymentInProgress || 0,
        deploymentLive: deploymentLive || 0,
        procurementRequested: 0, // TODO: Implement when procurement table is available
        procurementApproved: 0,
        procurementDispatched: 0,
        averageDeploymentTimePerSite
      };
    } catch (error) {
      console.error('Error fetching deployment engineer dashboard metrics:', error);
      return {};
    }
  }

  // Task Queue Methods
  static async getAdminTaskQueue(): Promise<TaskQueueItem[]> {
    try {
      const tasks: TaskQueueItem[] = [];

      // Get approval escalations
      const { data: escalationSites } = await supabase
        .from('sites')
        .select('id, name, cost_approval_status, created_at')
        .eq('cost_approval_status', 'Pending')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      escalationSites?.forEach(site => {
        tasks.push({
          id: site.id,
          title: `Approval Escalation: ${site.name}`,
          description: `Hardware approval pending for ${site.name}`,
          priority: 'high',
          status: 'pending',
          dueDate: new Date(site.created_at).toISOString(),
          type: 'approval_escalation'
        });
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching admin task queue:', error);
      return [];
    }
  }

  static async getOpsManagerTaskQueue(userId: string): Promise<TaskQueueItem[]> {
    try {
      const tasks: TaskQueueItem[] = [];

      // Get pending approvals for assigned sites
      const { data: pendingSites } = await supabase
        .from('sites')
        .select('id, name, cost_approval_status, created_at')
        .eq('cost_approval_status', 'Pending')
        .eq('ops_manager_id', userId);

      pendingSites?.forEach(site => {
        tasks.push({
          id: site.id,
          title: `Hardware Approval: ${site.name}`,
          description: `Review and approve hardware request for ${site.name}`,
          priority: 'high',
          status: 'pending',
          dueDate: new Date(site.created_at).toISOString(),
          type: 'hardware_approval'
        });
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching ops manager task queue:', error);
      return [];
    }
  }

  static async getDeploymentEngineerTaskQueue(userId: string): Promise<TaskQueueItem[]> {
    try {
      const tasks: TaskQueueItem[] = [];

      // Get sites needing study submissions
      const { data: studySites } = await supabase
        .from('sites')
        .select('id, name, study_status, created_at')
        .eq('study_status', 'Pending Submission')
        .eq('deployment_engineer_id', userId);

      studySites?.forEach(site => {
        tasks.push({
          id: site.id,
          title: `Site Study: ${site.name}`,
          description: `Complete site study for ${site.name}`,
          priority: 'high',
          status: 'pending',
          dueDate: new Date(site.created_at).toISOString(),
          type: 'site_study'
        });
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching deployment engineer task queue:', error);
      return [];
    }
  }

  // Exception Alerts Methods
  static async getAdminExceptionAlerts(): Promise<ExceptionAlert[]> {
    try {
      const alerts: ExceptionAlert[] = [];

      // Get sites with overdue deployment
      const { data: overdueSites } = await supabase
        .from('sites')
        .select('id, name, deployment_due_date')
        .lt('deployment_due_date', new Date().toISOString())
        .eq('deployment_status', 'In Progress');

      overdueSites?.forEach(site => {
        alerts.push({
          id: site.id,
          title: `Overdue Deployment: ${site.name}`,
          description: `Deployment overdue for ${site.name}`,
          severity: 'high',
          type: 'overdue_deployment',
          timestamp: new Date().toISOString()
        });
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching admin exception alerts:', error);
      return [];
    }
  }

  static async getOpsManagerExceptionAlerts(userId: string): Promise<ExceptionAlert[]> {
    try {
      const alerts: ExceptionAlert[] = [];

      // Get assets flagged for maintenance
      const { data: maintenanceAssets } = await supabase
        .from('inventory_items')
        .select('id, serial_number, model, status')
        .eq('status', 'maintenance');

      maintenanceAssets?.forEach(asset => {
        alerts.push({
          id: asset.id,
          title: `Maintenance Required: ${asset.model}`,
          description: `Asset ${asset.serial_number} requires maintenance`,
          severity: 'medium',
          type: 'maintenance_required',
          timestamp: new Date().toISOString()
        });
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching ops manager exception alerts:', error);
      return [];
    }
  }

  static async getDeploymentEngineerExceptionAlerts(userId: string): Promise<ExceptionAlert[]> {
    try {
      const alerts: ExceptionAlert[] = [];

      // Get sites missing scoping data
      const { data: missingScopingSites } = await supabase
        .from('sites')
        .select('id, name, hardware_scoping_status')
        .eq('hardware_scoping_status', 'Missing')
        .eq('deployment_engineer_id', userId);

      missingScopingSites?.forEach(site => {
        alerts.push({
          id: site.id,
          title: `Missing Scoping Data: ${site.name}`,
          description: `Hardware scoping data missing for ${site.name}`,
          severity: 'high',
          type: 'missing_scoping_data',
          timestamp: new Date().toISOString()
        });
      });

      return alerts;
    } catch (error) {
      console.error('Error fetching deployment engineer exception alerts:', error);
      return [];
    }
  }
} 