import { supabase } from '@/integrations/supabase/client';
import { ScopingSelection, ScopingCostBreakdown } from './scopingService';

// Approval workflow interfaces
export interface ScopingApproval {
  id: string;
  siteId: string;
  siteName: string;
  deploymentEngineerId: string;
  deploymentEngineerName: string;
  opsManagerId: string | null;
  opsManagerName: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewComment: string | null;
  rejectionReason: string | null;
  scopingData: ScopingSelection;
  costBreakdown: ScopingCostBreakdown;
  version: number;
  previousVersionId: string | null;
}

export interface ApprovalAction {
  id: string;
  approvalId: string;
  action: 'submit' | 'approve' | 'reject' | 'request_changes' | 'resubmit';
  performedBy: string;
  performedByRole: string;
  performedAt: string;
  comment: string | null;
  metadata: Record<string, any>;
}

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

    const { data, error } = await supabase
      .from('scoping_approvals')
      .insert([approval])
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

    return data;
  } catch (error) {
    console.error('Error submitting scoping for approval:', error);
    throw error;
  }
};

export const getApprovalDashboard = async (userId: string, userRole: string): Promise<ApprovalDashboard> => {
  try {
    let pendingApprovals: ScopingApproval[] = [];
    let myApprovals: ScopingApproval[] = [];

    if (userRole === 'ops_manager') {
      // Get all pending approvals for Ops Managers
      const { data: pendingData, error: pendingError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('submittedAt', { ascending: false });

      if (pendingError) throw pendingError;
      pendingApprovals = pendingData || [];

      // Get approvals assigned to this Ops Manager
      const { data: assignedData, error: assignedError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('opsManagerId', userId)
        .order('submittedAt', { ascending: false });

      if (assignedError) throw assignedError;
      myApprovals = assignedData || [];
    } else if (userRole === 'deployment_engineer') {
      // Get approvals submitted by this Deployment Engineer
      const { data: submittedData, error: submittedError } = await supabase
        .from('scoping_approvals')
        .select('*')
        .eq('deploymentEngineerId', userId)
        .order('submittedAt', { ascending: false });

      if (submittedError) throw submittedError;
      myApprovals = submittedData || [];
    }

    // Get recent activity
    const { data: activityData, error: activityError } = await supabase
      .from('approval_actions')
      .select('*')
      .order('performedAt', { ascending: false })
      .limit(20);

    if (activityError) throw activityError;

    // Calculate statistics
    const totalPending = pendingApprovals.length;
    const totalApproved = myApprovals.filter(a => a.status === 'approved').length;
    const totalRejected = myApprovals.filter(a => a.status === 'rejected').length;

    // Calculate average response time (simplified)
    const approvedApprovals = myApprovals.filter(a => a.status === 'approved' && a.reviewedAt);
    const totalResponseTime = approvedApprovals.reduce((total, approval) => {
      const submitted = new Date(approval.submittedAt).getTime();
      const reviewed = new Date(approval.reviewedAt!).getTime();
      return total + (reviewed - submitted);
    }, 0);
    const averageResponseTime = approvedApprovals.length > 0 ? totalResponseTime / approvedApprovals.length : 0;

    return {
      pendingApprovals,
      myApprovals,
      recentActivity: activityData || [],
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
        reviewedAt: new Date().toISOString(),
        reviewedBy: opsManagerId,
        reviewComment: comment,
        opsManagerId,
        opsManagerName
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
      .select('siteId')
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
        .eq('id', approval.siteId);
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
        reviewedAt: new Date().toISOString(),
        reviewedBy: opsManagerId,
        reviewComment: comment,
        rejectionReason,
        opsManagerId,
        opsManagerName
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
        reviewedAt: new Date().toISOString(),
        reviewedBy: opsManagerId,
        reviewComment: comment,
        opsManagerId,
        opsManagerName
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

    const { data, error } = await supabase
      .from('scoping_approvals')
      .insert([approval])
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

    return data;
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
      .eq('approvalId', approvalId)
      .order('performedAt', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting approval history:', error);
    throw error;
  }
};

const logApprovalAction = async (action: Omit<ApprovalAction, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('approval_actions')
      .insert([action]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging approval action:', error);
    // Don't throw here as this is a logging function
  }
};
