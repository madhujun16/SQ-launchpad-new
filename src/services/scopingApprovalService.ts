// Scoping Approval Service - Handles scoping submission and approval workflow

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { ScopingApproval, convertApprovalRowToApproval, convertApprovalToRow } from '@/types/scopingApproval';

export interface ScopingSubmissionData {
  siteId: string;
  siteName: string;
  selectedSoftware: Array<{ id: string; quantity: number }>;
  selectedHardware: Array<{ id: string; quantity: number }>;
  costSummary: {
    hardwareCost: number;
    softwareSetupCost: number;
    installationCost: number;
    contingencyCost: number;
    totalCapex: number;
    monthlySoftwareFees: number;
    maintenanceCost: number;
    totalMonthlyOpex: number;
    totalInvestment: number;
  };
}

export interface ApprovalActionData {
  approvalId: string;
  action: 'approve' | 'reject';
  comment: string;
}

export const ScopingApprovalService = {
  /**
   * Submit scoping for approval
   * Backend endpoint: POST /api/site/{site_id}/scoping/submit
   */
  async submitScopingForApproval(data: ScopingSubmissionData): Promise<ScopingApproval | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: ScopingApproval;
      }>(`/site/${data.siteId}/scoping/submit`, {
        site_name: data.siteName,
        selected_software: data.selectedSoftware,
        selected_hardware: data.selectedHardware,
        cost_summary: data.costSummary,
      });

      // Handle 401 Unauthorized - session expired or not authenticated
      if (response.error?.statusCode === 401) {
        console.warn('🔒 Authentication required for scoping submission - session may have expired');
        const errorMessage = response.error?.message || 'Your session has expired. Please login again.';
        
        // Clear auth and show error message
        if (typeof window !== 'undefined') {
          const { AuthService } = await import('./authService');
          AuthService.clearAuth();
          
          // Show toast message
          const { toast } = await import('sonner');
          toast.error('Session expired. Please login again to submit scoping for approval.');
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/auth') {
            setTimeout(() => {
              window.location.href = '/auth';
            }, 1500);
          }
        }
        
        throw new Error(errorMessage);
      }

      if (response.success && response.data?.data) {
        return convertApprovalRowToApproval(response.data.data as any);
      }
      
      // Handle other errors
      const errorMessage = response.error?.message || 'Failed to submit scoping for approval';
      throw new Error(errorMessage);
    } catch (error) {
      console.error('❌ ScopingApprovalService.submitScopingForApproval: Error submitting scoping:', error);
      throw error;
    }
  },

  /**
   * Get pending scoping approvals
   * Backend endpoint: GET /api/scoping-approvals?status=pending
   */
  async getPendingApprovals(): Promise<ScopingApproval[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: ScopingApproval[];
      }>('/scoping-approvals?status=pending');

      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data)
          ? response.data.data.map((row: any) => convertApprovalRowToApproval(row))
          : [];
      }
      return [];
    } catch (error) {
      console.error('❌ ScopingApprovalService.getPendingApprovals: Error fetching pending approvals:', error);
      return [];
    }
  },

  /**
   * Get all scoping approvals (with filters)
   * Backend endpoint: GET /api/scoping-approvals?status={status}&site_id={site_id}
   */
  async getApprovals(filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    siteId?: string;
  }): Promise<ScopingApproval[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.siteId) params.append('site_id', filters.siteId);

      const queryString = params.toString();
      const endpoint = queryString ? `/scoping-approvals?${queryString}` : '/scoping-approvals';

      const response = await apiClient.get<{
        message: string;
        data: ScopingApproval[];
      }>(endpoint);

      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data)
          ? response.data.data.map((row: any) => convertApprovalRowToApproval(row))
          : [];
      }
      return [];
    } catch (error) {
      console.error('❌ ScopingApprovalService.getApprovals: Error fetching approvals:', error);
      return [];
    }
  },

  /**
   * Get scoping approval by ID
   * Backend endpoint: GET /api/scoping-approvals/{approval_id}
   */
  async getApprovalById(approvalId: string): Promise<ScopingApproval | null> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: ScopingApproval;
      }>(`/scoping-approvals/${approvalId}`);

      if (response.success && response.data?.data) {
        return convertApprovalRowToApproval(response.data.data as any);
      }
      return null;
    } catch (error) {
      console.error('❌ ScopingApprovalService.getApprovalById: Error fetching approval:', error);
      return null;
    }
  },

  /**
   * Get scoping approval by site ID
   * Backend endpoint: GET /api/scoping-approvals?site_id={site_id}
   */
  async getApprovalBySiteId(siteId: string): Promise<ScopingApproval | null> {
    try {
      const approvals = await this.getApprovals({ siteId });
      // Return the most recent approval (highest version)
      if (approvals.length > 0) {
        return approvals.sort((a, b) => b.version - a.version)[0];
      }
      return null;
    } catch (error) {
      console.error('❌ ScopingApprovalService.getApprovalBySiteId: Error fetching approval:', error);
      return null;
    }
  },

  /**
   * Approve scoping
   * Backend endpoint: POST /api/scoping-approvals/{approval_id}/approve
   */
  async approveScoping(approvalId: string, comment: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{
        message: string;
      }>(`/scoping-approvals/${approvalId}/approve`, {
        comment,
      });

      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to approve scoping';
        console.error('❌ ScopingApprovalService.approveScoping: Approve failed:', {
          approvalId,
          error: response.error,
          message: errorMsg,
        });
        throw new Error(errorMsg);
      }

      return true;
    } catch (error) {
      console.error('❌ ScopingApprovalService.approveScoping: Error approving scoping:', error);
      throw error;
    }
  },

  /**
   * Reject scoping
   * Backend endpoint: POST /api/scoping-approvals/{approval_id}/reject
   */
  async rejectScoping(approvalId: string, comment: string, rejectionReason?: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{
        message: string;
      }>(`/scoping-approvals/${approvalId}/reject`, {
        comment,
        rejection_reason: rejectionReason || comment,
      });

      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to reject scoping';
        console.error('❌ ScopingApprovalService.rejectScoping: Reject failed:', {
          approvalId,
          error: response.error,
          message: errorMsg,
        });
        throw new Error(errorMsg);
      }

      return true;
    } catch (error) {
      console.error('❌ ScopingApprovalService.rejectScoping: Error rejecting scoping:', error);
      throw error;
    }
  },

  /**
   * Resubmit scoping after rejection
   * Backend endpoint: POST /api/site/{site_id}/scoping/resubmit
   */
  async resubmitScoping(data: ScopingSubmissionData, previousApprovalId: string): Promise<ScopingApproval | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: ScopingApproval;
      }>(`/site/${data.siteId}/scoping/resubmit`, {
        previous_approval_id: previousApprovalId,
        site_name: data.siteName,
        selected_software: data.selectedSoftware,
        selected_hardware: data.selectedHardware,
        cost_summary: data.costSummary,
      });

      // Handle 401 Unauthorized - session expired or not authenticated
      if (response.error?.statusCode === 401) {
        console.warn('🔒 Authentication required for scoping resubmission - session may have expired');
        const errorMessage = response.error?.message || 'Your session has expired. Please login again.';
        
        // Clear auth and show error message
        if (typeof window !== 'undefined') {
          const { AuthService } = await import('./authService');
          AuthService.clearAuth();
          
          // Show toast message
          const { toast } = await import('sonner');
          toast.error('Session expired. Please login again to resubmit scoping for approval.');
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/auth') {
            setTimeout(() => {
              window.location.href = '/auth';
            }, 1500);
          }
        }
        
        throw new Error(errorMessage);
      }

      if (response.success && response.data?.data) {
        return convertApprovalRowToApproval(response.data.data as any);
      }
      
      // Handle other errors
      const errorMessage = response.error?.message || 'Failed to resubmit scoping for approval';
      throw new Error(errorMessage);
    } catch (error) {
      console.error('❌ ScopingApprovalService.resubmitScoping: Error resubmitting scoping:', error);
      throw error;
    }
  },
};

