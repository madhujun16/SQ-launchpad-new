import { supabase } from '@/integrations/supabase/client';
import { Notification, CreateNotificationRequest, NotificationPreferences } from '@/types/notifications';

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get notifications for current user
  async getNotifications(limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  }

  // Create notification(s)
  async createNotification(request: CreateNotificationRequest): Promise<void> {
    const notifications = request.user_ids.map(userId => ({
      user_id: userId,
      type: request.type,
      title: request.title,
      message: request.message,
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      action_url: request.action_url,
      metadata: request.metadata,
      is_read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        }, 
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  }

  // Get user preferences
  async getPreferences(): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(preferences)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Helper methods for specific notification types
  async notifyApprovalSubmitted(siteId: string, siteName: string, opsManagerId: string, deploymentEngineerId: string): Promise<void> {
    await this.createNotification({
      user_ids: [opsManagerId],
      type: 'scoping_submitted',
      title: 'New Scoping Approval Submitted',
      message: `A new scoping approval for ${siteName} has been submitted for review.`,
      entity_type: 'site',
      entity_id: siteId,
      action_url: `/approvals/scoping/${siteId}`,
      metadata: { site_name: siteName, submitted_by: deploymentEngineerId }
    });
  }

  async notifyApprovalDecision(approvalId: string, siteName: string, decision: 'approved' | 'rejected', deploymentEngineerId: string, comment?: string): Promise<void> {
    await this.createNotification({
      user_ids: [deploymentEngineerId],
      type: 'approval_decision',
      title: `Scoping ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your scoping approval for ${siteName} has been ${decision}.${comment ? ` Comment: ${comment}` : ''}`,
      entity_type: 'scoping_approval',
      entity_id: approvalId,
      action_url: `/approvals/scoping/${approvalId}`,
      metadata: { site_name: siteName, decision, comment }
    });
  }

  async notifyResubmission(approvalId: string, siteName: string, opsManagerId: string): Promise<void> {
    await this.createNotification({
      user_ids: [opsManagerId],
      type: 'resubmission',
      title: 'Scoping Resubmitted',
      message: `The scoping approval for ${siteName} has been resubmitted for review.`,
      entity_type: 'scoping_approval',
      entity_id: approvalId,
      action_url: `/approvals/scoping/${approvalId}`,
      metadata: { site_name: siteName }
    });
  }

  async notifyProcurementUpdate(siteId: string, siteName: string, status: string, userIds: string[]): Promise<void> {
    await this.createNotification({
      user_ids: userIds,
      type: 'procurement_update',
      title: 'Procurement Status Update',
      message: `Procurement status for ${siteName} has been updated to ${status}.`,
      entity_type: 'site',
      entity_id: siteId,
      action_url: `/sites/${siteId}`,
      metadata: { site_name: siteName, status }
    });
  }

  async notifyDeploymentMilestone(deploymentId: string, siteName: string, milestone: string, userIds: string[]): Promise<void> {
    await this.createNotification({
      user_ids: userIds,
      type: 'deployment_milestone',
      title: 'Deployment Milestone',
      message: `${milestone} completed for ${siteName}.`,
      entity_type: 'deployment',
      entity_id: deploymentId,
      action_url: `/deployment/${deploymentId}`,
      metadata: { site_name: siteName, milestone }
    });
  }

  async notifyMaintenanceDue(assetId: string, assetName: string, opsManagerIds: string[]): Promise<void> {
    await this.createNotification({
      user_ids: opsManagerIds,
      type: 'maintenance_due',
      title: 'Maintenance Due',
      message: `Maintenance is due for asset ${assetName}.`,
      entity_type: 'asset',
      entity_id: assetId,
      action_url: `/assets/${assetId}`,
      metadata: { asset_name: assetName }
    });
  }
}

export const notificationService = NotificationService.getInstance();