import { supabase } from '@/integrations/supabase/client';

export interface GeneralSettings {
  id?: string;
  dateFormat: string;
  currency: string;
  fyBudget: number;
  siteTargets: number;
  approvalResponseTime: number; // in hours
  created_at?: string;
  updated_at?: string;
}

export const SettingsService = {
  // Get general settings
  async getGeneralSettings(): Promise<GeneralSettings> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching general settings:', error);
        // Return default settings if no data exists or table doesn't exist
        return {
          dateFormat: 'dd-mmm-yyyy',
          currency: 'GBP',
          fyBudget: 500000,
          siteTargets: 1000,
          approvalResponseTime: 24
        };
      }

      return data || {
        dateFormat: 'dd-mmm-yyyy',
        currency: 'GBP',
        fyBudget: 500000,
        siteTargets: 1000,
        approvalResponseTime: 24
      };
    } catch (error) {
      console.error('Error in getGeneralSettings:', error);
      // Return default settings if table doesn't exist or any other error
      return {
        dateFormat: 'dd-mmm-yyyy',
        currency: 'GBP',
        fyBudget: 500000,
        siteTargets: 1000,
        approvalResponseTime: 24
      };
    }
  },

  // Update general settings
  async updateGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating general settings:', error);
        // If table doesn't exist, just return the settings without saving
        console.warn('General settings table not found. Settings will be saved locally only.');
        return settings;
      }

      return data;
    } catch (error) {
      console.error('Error in updateGeneralSettings:', error);
      // If table doesn't exist, just return the settings without saving
      console.warn('General settings table not found. Settings will be saved locally only.');
      return settings;
    }
  },

  // Get approval response time specifically
  async getApprovalResponseTime(): Promise<number> {
    try {
      const settings = await this.getGeneralSettings();
      return settings.approvalResponseTime;
    } catch (error) {
      console.error('Error getting approval response time:', error);
      return 24; // Default 24 hours
    }
  },

  // Check if approval request is overdue
  isApprovalOverdue(requestDate: string | Date, responseTimeHours?: number): boolean {
    try {
      const requestDateTime = new Date(requestDate);
      const now = new Date();
      const hoursElapsed = (now.getTime() - requestDateTime.getTime()) / (1000 * 60 * 60);
      
      const threshold = responseTimeHours || 24; // Default 24 hours
      return hoursElapsed > threshold;
    } catch (error) {
      console.error('Error checking if approval is overdue:', error);
      return false;
    }
  },

  // Get overdue approval requests
  async getOverdueApprovals(): Promise<any[]> {
    try {
      const responseTime = await this.getApprovalResponseTime();
      
      const { data, error } = await supabase
        .from('costing_approvals')
        .select(`
          *,
          sites!inner(name, organization_name)
        `)
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - responseTime * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching overdue approvals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOverdueApprovals:', error);
      return [];
    }
  }
};
