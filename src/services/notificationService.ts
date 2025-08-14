// Temporarily disabled notification service until notifications table is created
import { Notification, NotificationPreferences } from '@/types/notifications';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  // Return empty array for now
  return [];
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  // No-op for now
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  // No-op for now
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  // Return 0 for now
  return 0;
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  // No-op for now
  return { unsubscribe: () => {} };
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<void> => {
  // No-op for now
};

export const getUserPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  // Return default preferences
  return {
    id: '',
    user_id: userId,
    email_enabled: true,
    push_enabled: true,
    scoping_notifications: true,
    approval_notifications: true,
    deployment_notifications: true,
    maintenance_notifications: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  // No-op for now
};