export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  created_by: string;
  metadata?: any;
  priority?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  scoping_notifications: boolean;
  approval_notifications: boolean;
  deployment_notifications: boolean;
  maintenance_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  user_ids: string[];
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  action_url?: string;
  metadata?: Record<string, any>;
}