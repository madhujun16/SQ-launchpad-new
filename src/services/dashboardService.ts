// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

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

// Mock data for dashboard until API is implemented
const MOCK_METRICS: DashboardMetrics = {
  totalSites: 0,
  activeDeployments: 0,
  pendingApprovals: 0,
  completedDeployments: 0,
  averageDeploymentTime: 0,
  customerSatisfaction: 0,
};

export const dashboardService = {
  async getDashboardStats() {
    console.warn('Dashboard API not implemented - returning mock data');
    return {
      totalUsers: 0,
      totalSites: 0,
      activeSites: 0,
      totalInventory: 0,
      availableInventory: 0,
      deployedInventory: 0,
      totalLicenses: 0,
      activeLicenses: 0,
      expiringLicenses: 0,
    };
  },

  async getOpsManagerDashboardMetrics(): Promise<DashboardMetrics> {
    console.warn('Dashboard API not implemented - returning mock data');
    return MOCK_METRICS;
  },

  async getTaskQueueItems(): Promise<TaskQueueItem[]> {
    return [];
  },

  async getExceptionAlerts(): Promise<ExceptionAlert[]> {
    return [];
  },

  async getDeploymentEngineerDashboardMetrics(): Promise<DashboardMetrics> {
    console.warn('Dashboard API not implemented - returning mock data');
    return MOCK_METRICS;
  },

  async getRecentSites(limit = 5) {
    return [];
  },

  async getRecentInventoryItems(limit = 5) {
    return [];
  },

  async getRecentLicenses(limit = 5) {
    return [];
  },

  async getAlerts() {
    return [];
  },

  async getUserTasks(userId: string) {
    return [];
  },
};
