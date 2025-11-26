// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface GeneralSettings {
  id?: string;
  dateFormat: string;
  currency: string;
  fyBudget: number;
  siteTargets: number;
  approvalResponseTime: number;
  created_at?: string;
  updated_at?: string;
}

// Default settings to use when API is not available
const DEFAULT_SETTINGS: GeneralSettings = {
  dateFormat: 'dd-mmm-yyyy',
  currency: 'GBP',
  fyBudget: 500000,
  siteTargets: 1000,
  approvalResponseTime: 24
};

export const SettingsService = {
  async getGeneralSettings(): Promise<GeneralSettings> {
    // Return default settings until GCP backend is connected
    console.warn('Settings API not implemented - returning defaults');
    return DEFAULT_SETTINGS;
  },

  async updateGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getApprovalResponseTime(): Promise<number> {
    try {
      const settings = await this.getGeneralSettings();
      return settings.approvalResponseTime;
    } catch (error) {
      console.error('Error getting approval response time:', error);
      return 24;
    }
  },

  isApprovalOverdue(requestDate: string | Date, responseTimeHours?: number): boolean {
    try {
      const requestDateTime = new Date(requestDate);
      const now = new Date();
      const hoursElapsed = (now.getTime() - requestDateTime.getTime()) / (1000 * 60 * 60);
      
      const threshold = responseTimeHours || 24;
      return hoursElapsed > threshold;
    } catch (error) {
      console.error('Error checking if approval is overdue:', error);
      return false;
    }
  },

  async getOverdueApprovals(): Promise<any[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }
};
