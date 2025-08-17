import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences, CreateNotificationRequest } from '@/types/notifications';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase.rpc('get_user_notifications', {
    _limit: 50,
    _offset: 0
  });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  // Map the response to include user_id since it's not returned by the function
  return (data || []).map(notification => ({
    ...notification,
    user_id: userId
  } as Notification));
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase.rpc('mark_notification_read', {
    _notification_id: notificationId
  });

  if (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('is_read', false);

  if (notifications && notifications.length > 0) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase.rpc('get_unread_notification_count');

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return data || 0;
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  const channel = supabase
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
      supabase.removeChannel(channel);
    }
  };
};

export const createNotification = async (request: CreateNotificationRequest): Promise<void> => {
  const { error } = await supabase.rpc('create_notification', {
    _user_ids: request.user_ids,
    _type: request.type,
    _title: request.title,
    _message: request.message,
    _entity_type: request.entity_type,
    _entity_id: request.entity_id,
    _action_url: request.action_url,
    _metadata: request.metadata || {}
  });

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, create default ones
      const defaultPreferences = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        scoping_notifications: true,
        approval_notifications: true,
        deployment_notifications: true,
        maintenance_notifications: true,
        forecast_notifications: true
      };

      const { data: newData, error: insertError } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default preferences:', insertError);
        return null;
      }

      return newData;
    }
    
    console.error('Error fetching notification preferences:', error);
    return null;
  }

  return data;
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  const { error } = await supabase
    .from('notification_preferences')
    .update({
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};