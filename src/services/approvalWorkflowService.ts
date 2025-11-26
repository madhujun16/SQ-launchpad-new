// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import { ScopingSelection, ScopingCostBreakdown } from './scopingService';
import { 
  ScopingApproval, 
  ApprovalAction
} from '@/types/scopingApproval';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface ApprovalDashboard {
  pendingApprovals: ScopingApproval[];
  myApprovals: ScopingApproval[];
  recentActivity: ApprovalAction[];
  statistics: {
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    averageResponseTime: number;
  };
}

export const submitScopingForApproval = async (
  siteId: string,
  siteName: string,
  deploymentEngineerId: string,
  deploymentEngineerName: string,
  scopingData: ScopingSelection,
  costBreakdown: ScopingCostBreakdown
): Promise<ScopingApproval> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const getApprovalDashboard = async (userId: string, userRole: string): Promise<ApprovalDashboard> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const approveScoping = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  comment: string | null
): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const rejectScoping = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  rejectionReason: string,
  comment: string | null
): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const requestScopingChanges = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  comment: string
): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const resubmitScoping = async (
  previousApprovalId: string,
  siteId: string,
  siteName: string,
  deploymentEngineerId: string,
  deploymentEngineerName: string,
  scopingData: ScopingSelection,
  costBreakdown: ScopingCostBreakdown,
  changesMade: string
): Promise<ScopingApproval> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const getApprovalHistory = async (approvalId: string): Promise<ApprovalAction[]> => {
  throw new Error(API_NOT_IMPLEMENTED);
};
