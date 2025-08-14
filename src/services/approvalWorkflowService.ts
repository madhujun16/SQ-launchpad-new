import { supabase } from '@/integrations/supabase/client';
import { ScopingSelection, ScopingCostBreakdown } from './scopingService';
import { 
  ScopingApproval, 
  ApprovalAction, 
  ScopingApprovalRow, 
  ApprovalActionRow,
  convertApprovalRowToApproval,
  convertActionRowToAction,
  convertApprovalToRow
} from '@/types/scopingApproval';

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

// Service functions
export const submitScopingForApproval = async (
  siteId: string,
  siteName: string,
  deploymentEngineerId: string,
  deploymentEngineerName: string,
  scopingData: ScopingSelection,
  costBreakdown: ScopingCostBreakdown
): Promise<ScopingApproval> => {
  try {
    const approval: Omit<ScopingApproval, 'id'> = {
      siteId,
      siteName,
      deploymentEngineerId,
      deploymentEngineerName,
      opsManagerId: null,
      opsManagerName: null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewComment: null,
      rejectionReason: null,
      scopingData,
      costBreakdown,
      version: 1,
      previousVersionId: null
    };

    const approvalRow = convertApprovalToRow(approval);

    const { data, error } = await supabase
      .from('scoping_approvals')
      .insert([approvalRow])
      .select()
      .single();

    if (error) throw error;

    // Log the submission action
    await logApprovalAction({
      approvalId: data.id,
      action: 'submit',
      performedBy: deploymentEngineerId,
      performedByRole: 'deployment_engineer',
      performedAt: new Date().toISOString(),
      comment: 'Scoping submitted for approval',
      metadata: { siteId, siteName }
    });

    return convertApprovalRowToApproval(data);
  } catch (error) {
    console.error('Error submitting scoping for approval:', error);
    throw error;
  }
};

export const getApprovalDashboard = async (userId: string, userRole: string): Promise<ApprovalDashboard> => {
  try {
    let pendingApprovals: ScopingApprovalRow[] = [];
    let myApprovals: ScopingApprovalRow[] = [];

    if (userRole === 'ops_manager') {
      // Get all pending approvals for Ops Managers
      const { data: pendingData, error: pendingError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (pendingError) throw pendingError;
      pendingApprovals = pendingData || [];

      // Get approvals assigned to this Ops Manager
      const { data: assignedData, error: assignedError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('ops_manager_id', userId)
        .order('submitted_at', { ascending: false });

      if (assignedError) throw assignedError;
      myApprovals = assignedData || [];
    } else if (userRole === 'deployment_engineer') {
      // Get approvals submitted by this Deployment Engineer
      const { data: submittedData, error: submittedError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('deployment_engineer_id', userId)
        .order('submitted_at', { ascending: false });

      if (submittedError) throw submittedError;
      myApprovals = submittedData || [];
    }

    // Get recent activity
    const { data: activityData, error: activityError } = await supabase
      .from('approval_actions')
      .select('*')
      .order('performed_at', { ascending: false })
      .limit(20);

    if (activityError) throw activityError;

    // Convert raw data to typed objects
    const convertedPendingApprovals = pendingApprovals.map(convertApprovalRowToApproval);
    const convertedMyApprovals = myApprovals.map(convertApprovalRowToApproval);
    const convertedRecentActivity = (activityData || []).map(convertActionRowToAction);

    // Calculate statistics
    const totalPending = convertedPendingApprovals.length;
    const totalApproved = convertedMyApprovals.filter(a => a.status === 'approved').length;
    const totalRejected = convertedMyApprovals.filter(a => a.status === 'rejected').length;

    // Calculate average response time (simplified)
    const approvedApprovals = convertedMyApprovals.filter(a => a.status === 'approved' && a.reviewedAt);
    const totalResponseTime = approvedApprovals.reduce((total, approval) => {
      const submitted = new Date(approval.submittedAt).getTime();
      const reviewed = new Date(approval.reviewedAt!).getTime();
      return total + (reviewed - submitted);
    }, 0);
    const averageResponseTime = approvedApprovals.length > 0 ? totalResponseTime / approvedApprovals.length : 0;

    return {
      pendingApprovals: convertedPendingApprovals,
      myApprovals: convertedMyApprovals,
      recentActivity: convertedRecentActivity,
      statistics: {
        totalPending,
        totalApproved,
        totalRejected,
        averageResponseTime
      }
    };
  } catch (error) {
    console.error('Error getting approval dashboard:', error);
    throw error;
  }
};

export const approveScoping = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  comment: string | null
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scoping_approvals')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: opsManagerId,
        review_comment: comment,
        ops_manager_id: opsManagerId,
        ops_manager_name: opsManagerName
      })
      .eq('id', approvalId);

    if (error) throw error;

    // Log the approval action
    await logApprovalAction({
      approvalId,
      action: 'approve',
      performedBy: opsManagerId,
      performedByRole: 'ops_manager',
      performedAt: new Date().toISOString(),
      comment: comment || 'Scoping approved',
      metadata: { approvalId }
    });

    // Update site status to "Ready for Procurement"
    const { data: approval } = await supabase
      .from('scoping_approvals')
      .select('site_id')
      .eq('id', approvalId)
      .single();

    if (approval) {
      await supabase
        .from('sites')
        .update({ 
          status: 'ready_for_procurement',
          scoping_approved_at: new Date().toISOString(),
          scoping_approved_by: opsManagerId
        })
        .eq('id', approval.site_id);
    }
  } catch (error) {
    console.error('Error approving scoping:', error);
    throw error;
  }
};

export const rejectScoping = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  rejectionReason: string,
  comment: string | null
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scoping_approvals')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: opsManagerId,
        review_comment: comment,
        rejection_reason: rejectionReason,
        ops_manager_id: opsManagerId,
        ops_manager_name: opsManagerName
      })
      .eq('id', approvalId);

    if (error) throw error;

    // Log the rejection action
    await logApprovalAction({
      approvalId,
      action: 'reject',
      performedBy: opsManagerId,
      performedByRole: 'ops_manager',
      performedAt: new Date().toISOString(),
      comment: rejectionReason,
      metadata: { approvalId, rejectionReason }
    });
  } catch (error) {
    console.error('Error rejecting scoping:', error);
    throw error;
  }
};

export const requestScopingChanges = async (
  approvalId: string,
  opsManagerId: string,
  opsManagerName: string,
  comment: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('scoping_approvals')
      .update({
        status: 'changes_requested',
        reviewed_at: new Date().toISOString(),
        reviewed_by: opsManagerId,
        review_comment: comment,
        ops_manager_id: opsManagerId,
        ops_manager_name: opsManagerName
      })
      .eq('id', approvalId);

    if (error) throw error;

    // Log the changes request action
    await logApprovalAction({
      approvalId,
      action: 'request_changes',
      performedBy: opsManagerId,
      performedByRole: 'ops_manager',
      performedAt: new Date().toISOString(),
      comment,
      metadata: { approvalId }
    });
  } catch (error) {
    console.error('Error requesting scoping changes:', error);
    throw error;
  }
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
  try {
    // Get the previous approval to increment version
    const { data: previousApproval } = await supabase
      .from('scoping_approvals')
      .select('version')
      .eq('id', previousApprovalId)
      .single();

    const newVersion = (previousApproval?.version || 1) + 1;

    const approval: Omit<ScopingApproval, 'id'> = {
      siteId,
      siteName,
      deploymentEngineerId,
      deploymentEngineerName,
      opsManagerId: null,
      opsManagerName: null,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewComment: null,
      rejectionReason: null,
      scopingData,
      costBreakdown,
      version: newVersion,
      previousVersionId: previousApprovalId
    };

    const approvalRow = convertApprovalToRow(approval);

    const { data, error } = await supabase
      .from('scoping_approvals')
      .insert([approvalRow])
      .select()
      .single();

    if (error) throw error;

    // Log the resubmission action
    await logApprovalAction({
      approvalId: data.id,
      action: 'resubmit',
      performedBy: deploymentEngineerId,
      performedByRole: 'deployment_engineer',
      performedAt: new Date().toISOString(),
      comment: `Resubmitted after changes: ${changesMade}`,
      metadata: { 
        siteId, 
        siteName, 
        previousApprovalId,
        changesMade 
      }
    });

    return convertApprovalRowToApproval(data);
  } catch (error) {
    console.error('Error resubmitting scoping:', error);
    throw error;
  }
};

export const getApprovalHistory = async (approvalId: string): Promise<ApprovalAction[]> => {
  try {
    const { data, error } = await supabase
      .from('approval_actions')
      .select('*')
      .eq('approval_id', approvalId)
      .order('performed_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(convertActionRowToAction);
  } catch (error) {
    console.error('Error getting approval history:', error);
    throw error;
  }
};

// Private helper function to log approval actions
const logApprovalAction = async (action: Omit<ApprovalAction, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('approval_actions')
      .insert([{
        approval_id: action.approvalId,
        action: action.action,
        performed_by: action.performedBy,
        performed_by_role: action.performedByRole,
        performed_at: action.performedAt,
        comment: action.comment,
        metadata: action.metadata
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging approval action:', error);
    throw error;
  }
};