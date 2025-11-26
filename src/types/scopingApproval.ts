// Database schema interfaces (snake_case matching database)
export interface ScopingApprovalRow {
  id: string;
  site_id: string;
  site_name: string;
  deployment_engineer_id: string;
  deployment_engineer_name: string;
  ops_manager_id: string | null;
  ops_manager_name: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_comment: string | null;
  rejection_reason: string | null;
  scoping_data: any;
  cost_breakdown: any;
  version: number;
  previous_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalActionRow {
  id: string;
  approval_id: string;
  action: string;
  performed_by: string;
  performed_by_role: string;
  performed_at: string;
  comment: string | null;
  metadata: any;
  created_at: string;
}

// Application interfaces (camelCase for frontend use)
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
  scopingData: any;
  costBreakdown: any;
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

// Conversion functions
export function convertApprovalRowToApproval(row: ScopingApprovalRow): ScopingApproval {
  return {
    id: row.id,
    siteId: row.site_id,
    siteName: row.site_name,
    deploymentEngineerId: row.deployment_engineer_id,
    deploymentEngineerName: row.deployment_engineer_name,
    opsManagerId: row.ops_manager_id,
    opsManagerName: row.ops_manager_name,
    status: row.status as ScopingApproval['status'],
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewComment: row.review_comment,
    rejectionReason: row.rejection_reason,
    scopingData: row.scoping_data,
    costBreakdown: row.cost_breakdown,
    version: row.version,
    previousVersionId: row.previous_version_id,
  };
}

export function convertActionRowToAction(row: ApprovalActionRow): ApprovalAction {
  return {
    id: row.id,
    approvalId: row.approval_id,
    action: row.action as ApprovalAction['action'],
    performedBy: row.performed_by,
    performedByRole: row.performed_by_role,
    performedAt: row.performed_at,
    comment: row.comment,
    metadata: row.metadata || {},
  };
}

export function convertApprovalToRow(approval: Omit<ScopingApproval, 'id'>): Omit<ScopingApprovalRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    site_id: approval.siteId,
    site_name: approval.siteName,
    deployment_engineer_id: approval.deploymentEngineerId,
    deployment_engineer_name: approval.deploymentEngineerName,
    ops_manager_id: approval.opsManagerId,
    ops_manager_name: approval.opsManagerName,
    status: approval.status,
    submitted_at: approval.submittedAt,
    reviewed_at: approval.reviewedAt,
    reviewed_by: approval.reviewedBy,
    review_comment: approval.reviewComment,
    rejection_reason: approval.rejectionReason,
    scoping_data: approval.scopingData,
    cost_breakdown: approval.costBreakdown,
    version: approval.version,
    previous_version_id: approval.previousVersionId,
  };
}