export interface CostingItem {
  id: string;
  costing_approval_id: string;
  item_type: 'hardware' | 'software' | 'license';
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  monthly_fee?: number;
  annual_fee?: number;
  is_required: boolean;
  category?: string;
  manufacturer?: string;
  model?: string;
  created_at: string;
  updated_at: string;
}

export interface CostingApproval {
  id: string;
  site_id: string;
  deployment_engineer_id: string;
  ops_manager_id: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'resubmitted';
  total_hardware_cost: number;
  total_software_cost: number;
  total_license_cost: number;
  total_monthly_fees: number;
  grand_total: number;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_comment?: string;
  rejection_reason?: string;
  procurement_status: 'pending' | 'approved' | 'ordered' | 'in_transit' | 'delivered' | 'installed';
  created_at: string;
  updated_at: string;
  
  // Extended fields for UI
  site_name?: string;
  deployment_engineer_name?: string;
  ops_manager_name?: string;
  costing_items?: CostingItem[];
}

export interface CostingApprovalAuditLog {
  id: string;
  costing_approval_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'procurement_started';
  user_id: string;
  user_role: string;
  timestamp: string;
  comment?: string;
  metadata?: Record<string, any>;
  
  // Extended fields for UI
  user_name?: string;
}

export interface CostingSummary {
  hardware_items: CostingItem[];
  software_items: CostingItem[];
  license_items: CostingItem[];
  totals: {
    hardware: number;
    software: number;
    licenses: number;
    monthly_fees: number;
    grand_total: number;
  };
}

export interface CostingApprovalRequest {
  site_id: string;
  ops_manager_id: string;
  costing_items: Omit<CostingItem, 'id' | 'costing_approval_id' | 'created_at' | 'updated_at'>[];
}

export interface CostingApprovalReview {
  approval_id: string;
  action: 'approve' | 'reject';
  comment: string;
  rejection_reason?: string;
}
