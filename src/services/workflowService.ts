// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import { UnifiedSiteStatus, validateStatusProgression, canProgressToStatus, getNextValidStatuses } from '@/lib/siteTypes';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface StatusTransitionRequest {
  siteId: string;
  fromStatus: UnifiedSiteStatus;
  toStatus: UnifiedSiteStatus;
  userId: string;
  userRole: 'admin' | 'ops_manager' | 'deployment_engineer';
  reason?: string;
}

export interface StatusTransitionResult {
  success: boolean;
  message: string;
  newStatus?: UnifiedSiteStatus;
  timestamp?: string;
}

export interface WorkflowAuditLog {
  id: string;
  site_id: string;
  from_status: UnifiedSiteStatus;
  to_status: UnifiedSiteStatus;
  user_id: string;
  user_role: string;
  reason?: string;
  admin_override: boolean;
  created_at: string;
}

export class WorkflowService {
  static async transitionSiteStatus(request: StatusTransitionRequest): Promise<StatusTransitionResult> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static getValidNextStatuses(currentStatus: UnifiedSiteStatus, userRole: 'admin' | 'ops_manager' | 'deployment_engineer'): UnifiedSiteStatus[] {
    const allStatuses: UnifiedSiteStatus[] = ['Created', 'site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live'];
    
    if (userRole === 'admin') {
      return allStatuses.filter(status => status !== currentStatus);
    }

    return getNextValidStatuses(currentStatus);
  }

  private static hasTransitionPermission(fromStatus: UnifiedSiteStatus, toStatus: UnifiedSiteStatus, userRole: string): boolean {
    if (userRole === 'admin') return true;

    const rolePermissions: Record<string, { from: UnifiedSiteStatus[]; to: UnifiedSiteStatus[] }> = {
      ops_manager: {
        from: ['Created', 'site_study_done', 'scoping_done'],
        to: ['site_study_done', 'scoping_done', 'approved']
      },
      deployment_engineer: {
        from: ['approved', 'procurement_done'],
        to: ['procurement_done', 'deployed', 'live']
      }
    };

    const permissions = rolePermissions[userRole];
    if (!permissions) return false;

    return permissions.from.includes(fromStatus) && permissions.to.includes(toStatus);
  }

  static async getSiteAuditLogs(siteId: string): Promise<WorkflowAuditLog[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }

  static validateSiteProgression(currentStatus: UnifiedSiteStatus, targetStatus: UnifiedSiteStatus, isAdmin: boolean = false): { canProgress: boolean; message: string } {
    if (isAdmin) {
      return { canProgress: true, message: 'Admin override available' };
    }

    if (canProgressToStatus(currentStatus, targetStatus)) {
      return { canProgress: true, message: 'Valid progression' };
    }

    const validation = validateStatusProgression(currentStatus, targetStatus);
    return { canProgress: false, message: validation.message || 'Invalid progression' };
  }

  static async getWorkflowStats(): Promise<Record<UnifiedSiteStatus, number>> {
    throw new Error(API_NOT_IMPLEMENTED);
  }
}
