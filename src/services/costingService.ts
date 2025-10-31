// Temporary costing service placeholder
import { CostingApproval, CostingItem, CostingApprovalAuditLog } from '@/types/costing';

export const submitCostingForApproval = async (
  siteId: string,
  opsManagerId: string,
  costingItems: Omit<CostingItem, 'id' | 'costing_approval_id' | 'created_at' | 'updated_at'>[]
): Promise<CostingApproval> => {
  throw new Error('Not implemented yet');
};

export const getCostingApprovalById = async (approvalId: string): Promise<CostingApproval | null> => {
  throw new Error('Not implemented yet');
};

export const getCostingApprovals = async (): Promise<CostingApproval[]> => {
  return [];
};

export const getCostingItems = async (approvalId: string): Promise<CostingItem[]> => {
  return [];
};

export const getAuditLog = async (approvalId: string): Promise<CostingApprovalAuditLog[]> => {
  return [];
};

export const approveCostingApproval = async (
  approvalId: string,
  reviewerId: string,
  comment: string
): Promise<void> => {
  throw new Error('Not implemented yet');
};

export const rejectCostingApproval = async (
  approvalId: string,
  reviewerId: string,
  comment: string,
  rejectionReason: string
): Promise<void> => {
  throw new Error('Not implemented yet');
};

// Legacy class export for compatibility
export class CostingService {
  static async submitCostingForApproval(...args: Parameters<typeof submitCostingForApproval>) {
    return submitCostingForApproval(...args);
  }
  static async createCostingApproval(...args: Parameters<typeof submitCostingForApproval>) {
    return submitCostingForApproval(...args);
  }
  static async reviewCostingApproval(approvalId: string, decision: string, comment: string) {
    if (decision === 'approve') {
      return approveCostingApproval(approvalId, 'user-id', comment);
    } else {
      return rejectCostingApproval(approvalId, 'user-id', comment, 'Rejected');
    }
  }
  static async getCostingApprovalById(...args: Parameters<typeof getCostingApprovalById>) {
    return getCostingApprovalById(...args);
  }
  static async getCostingApprovals() {
    return getCostingApprovals();
  }
  static async approveCostingApproval(...args: Parameters<typeof approveCostingApproval>) {
    return approveCostingApproval(...args);
  }
  static async rejectCostingApproval(...args: Parameters<typeof rejectCostingApproval>) {
    return rejectCostingApproval(...args);
  }
}