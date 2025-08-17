import { supabase } from '@/lib/supabase/client';
import { Notification, NotificationPreferences, CreateNotificationRequest } from '@/types/notifications';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    }
  };
};

export const createNotification = async (notification: CreateNotificationRequest): Promise<void> => {
  try {
    const { error } = await supabase.rpc('create_notification', {
      _user_ids: notification.user_ids,
      _type: notification.type,
      _title: notification.title,
      _message: notification.message,
      _entity_type: notification.entity_type,
      _entity_id: notification.entity_id,
      _action_url: notification.action_url,
      _metadata: notification.metadata || {},
      _priority: 'normal'
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Additional utility functions for role-based notifications
export const getNotificationsByRole = async (
  userId: string, 
  role: string, 
  organizationId?: string
): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // If admin, get all notifications for their organization
    if (role === 'admin' && organizationId) {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('metadata->>organization_id', organizationId)
        .order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching role-based notifications:', error);
    return [];
  }
};

export const createSystemNotification = async (
  message: string,
  type: Notification['type'] = 'system_alert',
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<void> => {
  try {
    // Get all users for system-wide notification
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id');

    if (userError) throw userError;

    const userIds = users?.map(u => u.id) || [];
    
    if (userIds.length > 0) {
      await createNotification({
        user_ids: userIds,
        type,
        title: 'System Alert',
        message,
        entity_type: 'system',
        entity_id: 'system',
        metadata: { system_wide: true }
      });
    }
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
};