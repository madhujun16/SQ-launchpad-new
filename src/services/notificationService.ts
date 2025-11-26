// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import { Notification, NotificationPreferences, CreateNotificationRequest } from '@/types/notifications';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  // Return 0 until API is implemented
  console.warn('Notification API not implemented');
  return 0;
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
  console.warn('Real-time notifications not implemented - connect to GCP backend');
  return {
    unsubscribe: () => {}
  };
};

export const createNotification = async (notification: CreateNotificationRequest): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const getUserPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const getNotificationsByRole = async (
  userId: string, 
  role: string, 
  organizationId?: string
): Promise<Notification[]> => {
  throw new Error(API_NOT_IMPLEMENTED);
};

export const createSystemNotification = async (
  message: string,
  type: string = 'system_alert',
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<void> => {
  throw new Error(API_NOT_IMPLEMENTED);
};
