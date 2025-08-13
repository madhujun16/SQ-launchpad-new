import { supabase } from '@/integrations/supabase/client';
import { 
  CostingApproval, 
  CostingItem, 
  CostingApprovalAuditLog, 
  CostingSummary,
  CostingApprovalRequest,
  CostingApprovalReview
} from '@/types/costing';
import { toast } from 'sonner';

export class CostingService {
  // Create a new costing approval request
  static async createCostingApproval(request: CostingApprovalRequest): Promise<CostingApproval | null> {
    try {
      // First create the costing approval record
      const { data: approval, error: approvalError } = await supabase
        .from('costing_approvals')
        .insert([{
          site_id: request.site_id,
          deployment_engineer_id: (await supabase.auth.getUser()).data.user?.id,
          ops_manager_id: request.ops_manager_id,
          status: 'pending_review'
        }])
        .select()
        .single();

      if (approvalError) {
        console.error('Error creating costing approval:', approvalError);
        toast.error('Failed to create costing approval');
        return null;
      }

      // Then create all the costing items
      const costingItems = request.costing_items.map(item => ({
        ...item,
        costing_approval_id: approval.id,
        total_cost: item.quantity * item.unit_cost
      }));

      const { error: itemsError } = await supabase
        .from('costing_items')
        .insert(costingItems);

      if (itemsError) {
        console.error('Error creating costing items:', itemsError);
        toast.error('Failed to create costing items');
        return null;
      }

      // Log the submission action
      await supabase.rpc('log_costing_approval_action', {
        p_approval_id: approval.id,
        p_action: 'submitted',
        p_comment: 'Costing approval submitted for review'
      });

      toast.success('Costing approval submitted successfully');
      return approval;
    } catch (error) {
      console.error('Error in createCostingApproval:', error);
      toast.error('Failed to create costing approval');
      return null;
    }
  }

  // Get costing approvals for a user (based on their role)
  static async getCostingApprovals(): Promise<CostingApproval[]> {
    try {
      const { data: approvals, error } = await supabase
        .from('costing_approvals')
        .select(`
          *,
          sites!inner(name),
          profiles!costing_approvals_deployment_engineer_id_fkey!inner(full_name),
          profiles!costing_approvals_ops_manager_id_fkey!inner(full_name)
        `);

      if (error) {
        console.error('Error fetching costing approvals:', error);
        return [];
      }

      return approvals.map(approval => ({
        ...approval,
        site_name: approval.sites?.name,
        deployment_engineer_name: approval.profiles?.full_name,
        ops_manager_name: approval.profiles?.full_name
      }));
    } catch (error) {
      console.error('Error in getCostingApprovals:', error);
      return [];
    }
  }

  // Get costing approval details with items
  static async getCostingApprovalDetails(approvalId: string): Promise<CostingApproval | null> {
    try {
      // Get the approval record
      const { data: approval, error: approvalError } = await supabase
        .from('costing_approvals')
        .select(`
          *,
          sites!inner(name),
          profiles!costing_approvals_deployment_engineer_id_fkey!inner(full_name),
          profiles!costing_approvals_ops_manager_id_fkey!inner(full_name)
        `)
        .eq('id', approvalId)
        .single();

      if (approvalError) {
        console.error('Error fetching costing approval:', approvalError);
        return null;
      }

      // Get the costing items
      const { data: items, error: itemsError } = await supabase
        .from('costing_items')
        .select('*')
        .eq('costing_approval_id', approvalId)
        .order('item_type', { ascending: true });

      if (itemsError) {
        console.error('Error fetching costing items:', itemsError);
        return null;
      }

      return {
        ...approval,
        site_name: approval.sites?.name,
        deployment_engineer_name: approval.profiles?.full_name,
        ops_manager_name: approval.profiles?.full_name,
        costing_items: items || []
      };
    } catch (error) {
      console.error('Error in getCostingApprovalDetails:', error);
      return null;
    }
  }

  // Review a costing approval (approve/reject)
  static async reviewCostingApproval(review: CostingApprovalReview): Promise<boolean> {
    try {
      const updateData: any = {
        status: review.action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        review_comment: review.comment
      };

      if (review.action === 'reject' && review.rejection_reason) {
        updateData.rejection_reason = review.rejection_reason;
      }

      if (review.action === 'approve') {
        updateData.procurement_status = 'approved';
      }

      const { error } = await supabase
        .from('costing_approvals')
        .update(updateData)
        .eq('id', review.approval_id);

      if (error) {
        console.error('Error updating costing approval:', error);
        toast.error('Failed to update costing approval');
        return false;
      }

      // Log the review action
      await supabase.rpc('log_costing_approval_action', {
        p_approval_id: review.approval_id,
        p_action: review.action,
        p_comment: review.comment,
        p_metadata: review.action === 'reject' ? { rejection_reason: review.rejection_reason } : null
      });

      toast.success(`Costing approval ${review.action}d successfully`);
      return true;
    } catch (error) {
      console.error('Error in reviewCostingApproval:', error);
      toast.error('Failed to review costing approval');
      return false;
    }
  }

  // Resubmit a rejected costing approval
  static async resubmitCostingApproval(approvalId: string, updatedItems: Omit<CostingItem, 'id' | 'costing_approval_id' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
    try {
      // Update the approval status
      const { error: approvalError } = await supabase
        .from('costing_approvals')
        .update({
          status: 'resubmitted',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (approvalError) {
        console.error('Error updating approval status:', approvalError);
        return false;
      }

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('costing_items')
        .delete()
        .eq('costing_approval_id', approvalId);

      if (deleteError) {
        console.error('Error deleting existing items:', deleteError);
        return false;
      }

      // Create new items
      const costingItems = updatedItems.map(item => ({
        ...item,
        costing_approval_id: approvalId,
        total_cost: item.quantity * item.unit_cost
      }));

      const { error: itemsError } = await supabase
        .from('costing_items')
        .insert(costingItems);

      if (itemsError) {
        console.error('Error creating new items:', itemsError);
        return false;
      }

      // Log the resubmission action
      await supabase.rpc('log_costing_approval_action', {
        p_approval_id: approvalId,
        p_action: 'resubmitted',
        p_comment: 'Costing approval resubmitted after rejection'
      });

      toast.success('Costing approval resubmitted successfully');
      return true;
    } catch (error) {
      console.error('Error in resubmitCostingApproval:', error);
      toast.error('Failed to resubmit costing approval');
      return false;
    }
  }

  // Get audit log for a costing approval
  static async getCostingApprovalAuditLog(approvalId: string): Promise<CostingApprovalAuditLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('costing_approval_audit_log')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .eq('costing_approval_id', approvalId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching audit log:', error);
        return [];
      }

      return logs.map(log => ({
        ...log,
        user_name: log.profiles?.full_name
      }));
    } catch (error) {
      console.error('Error in getCostingApprovalAuditLog:', error);
      return [];
    }
  }

  // Get costing summary for a site
  static async getCostingSummary(siteId: string): Promise<CostingSummary | null> {
    try {
      const { data: items, error } = await supabase
        .from('costing_items')
        .select('*')
        .eq('site_id', siteId);

      if (error) {
        console.error('Error fetching costing summary:', error);
        return null;
      }

      const hardware_items = items.filter(item => item.item_type === 'hardware');
      const software_items = items.filter(item => item.item_type === 'software');
      const license_items = items.filter(item => item.item_type === 'license');

      const totals = {
        hardware: hardware_items.reduce((sum, item) => sum + item.total_cost, 0),
        software: software_items.reduce((sum, item) => sum + item.total_cost, 0),
        licenses: license_items.reduce((sum, item) => sum + item.total_cost, 0),
        monthly_fees: items.reduce((sum, item) => sum + (item.monthly_fee || 0), 0),
        grand_total: items.reduce((sum, item) => sum + item.total_cost, 0)
      };

      return {
        hardware_items,
        software_items,
        license_items,
        totals
      };
    } catch (error) {
      console.error('Error in getCostingSummary:', error);
      return null;
    }
  }

  // Update procurement status
  static async updateProcurementStatus(approvalId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('costing_approvals')
        .update({
          procurement_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', approvalId);

      if (error) {
        console.error('Error updating procurement status:', error);
        return false;
      }

      // Log the procurement status change
      await supabase.rpc('log_costing_approval_action', {
        p_approval_id: approvalId,
        p_action: 'procurement_started',
        p_comment: `Procurement status updated to: ${status}`
      });

      return true;
    } catch (error) {
      console.error('Error in updateProcurementStatus:', error);
      return false;
    }
  }
}
