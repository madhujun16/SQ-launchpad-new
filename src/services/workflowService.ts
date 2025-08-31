import { UnifiedSiteStatus, validateStatusProgression, canProgressToStatus, getNextValidStatuses } from '@/lib/siteTypes';
import { supabase } from '@/integrations/supabase/client';

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
  /**
   * Attempt to transition a site from one status to another
   * Enforces progression rules unless admin override is used
   */
  static async transitionSiteStatus(request: StatusTransitionRequest): Promise<StatusTransitionResult> {
    try {
      const { siteId, fromStatus, toStatus, userId, userRole, reason } = request;
      
      // Check if user has permission to make this transition
      if (!this.hasTransitionPermission(fromStatus, toStatus, userRole)) {
        return {
          success: false,
          message: `Insufficient permissions. ${userRole} cannot transition from ${fromStatus} to ${toStatus}`
        };
      }

      // Validate progression rules
      const isAdmin = userRole === 'admin';
      const validation = validateStatusProgression(fromStatus, toStatus);
      
      if (!validation.valid && !isAdmin) {
        return {
          success: false,
          message: validation.message || 'Invalid status progression'
        };
      }

      // If admin is making an invalid progression, log it as an override
      const adminOverride = !validation.valid && isAdmin;

      // Update the site status in the database
      const { data, error } = await supabase
        .from('sites')
        .update({ 
          status: toStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', siteId)
        .select()
        .single();

      if (error) {
        console.error('Error updating site status:', error);
        return {
          success: false,
          message: 'Failed to update site status in database'
        };
      }

      // Log the transition for audit purposes
      await this.logStatusTransition({
        site_id: siteId,
        from_status: fromStatus,
        to_status: toStatus,
        user_id: userId,
        user_role: userRole,
        reason,
        admin_override: adminOverride
      });

      return {
        success: true,
        message: adminOverride 
          ? `Status updated with admin override from ${fromStatus} to ${toStatus}`
          : `Status successfully updated from ${fromStatus} to ${toStatus}`,
        newStatus: toStatus,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error in status transition:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during status transition'
      };
    }
  }

  /**
   * Get valid next statuses for a given current status and user role
   */
  static getValidNextStatuses(currentStatus: UnifiedSiteStatus, userRole: 'admin' | 'ops_manager' | 'deployment_engineer'): UnifiedSiteStatus[] {
    const allStatuses: UnifiedSiteStatus[] = ['Created', 'site_study_done', 'scoping_done', 'approved', 'procurement_done', 'deployed', 'live'];
    
    if (userRole === 'admin') {
      // Admin can move to any status (with override)
      return allStatuses.filter(status => status !== currentStatus);
    }

    // Non-admin users can only progress to the next logical status
    return getNextValidStatuses(currentStatus);
  }

  /**
   * Check if a user role has permission to make a specific transition
   */
  private static hasTransitionPermission(fromStatus: UnifiedSiteStatus, toStatus: UnifiedSiteStatus, userRole: string): boolean {
    // Admin can make any transition
    if (userRole === 'admin') return true;

    // Define role-based transition permissions
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

  /**
   * Log status transition for audit trail
   */
  private static async logStatusTransition(log: Omit<WorkflowAuditLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_audit_logs')
        .insert([{
          ...log,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error logging status transition:', error);
      }
    } catch (error) {
      console.error('Error in logStatusTransition:', error);
    }
  }

  /**
   * Get workflow audit logs for a specific site
   */
  static async getSiteAuditLogs(siteId: string): Promise<WorkflowAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_audit_logs')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSiteAuditLogs:', error);
      return [];
    }
  }

  /**
   * Validate if a site can progress to a specific status
   */
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

  /**
   * Get workflow statistics for dashboard
   */
  static async getWorkflowStats(): Promise<Record<UnifiedSiteStatus, number>> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('status');

      if (error) {
        console.error('Error fetching workflow stats:', error);
        return {} as Record<UnifiedSiteStatus, number>;
      }

      const stats: Record<UnifiedSiteStatus, number> = {
        Created: 0,
        site_study_done: 0,
        scoping_done: 0,
        approved: 0,
        procurement_done: 0,
        deployed: 0,
        live: 0
      };

      data?.forEach(site => {
        const status = site.status as UnifiedSiteStatus;
        if (stats[status] !== undefined) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getWorkflowStats:', error);
      return {} as Record<UnifiedSiteStatus, number>;
    }
  }
}
