export interface Notification {
  id: string;
  user_id: string;
  type: 'scoping_submitted' | 'approval_decision' | 'resubmission' | 'procurement_update' | 'deployment_milestone' | 'maintenance_due' | 'forecast_risk' | 'system_alert';
  title: string;
  message: string;
  entity_type: 'site' | 'scoping_approval' | 'costing_approval' | 'deployment' | 'asset';
  entity_id: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  created_by: string;
  metadata?: Record<string, any>;
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
  type: Notification['type'];
  title: string;
  message: string;
  entity_type: Notification['entity_type'];
  entity_id: string;
  action_url?: string;
  metadata?: Record<string, any>;
}