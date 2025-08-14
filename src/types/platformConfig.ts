export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  monthly_fee?: number;
  setup_fee?: number;
  license_fee?: number;
  created_at: string;
  updated_at: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  model: string;
  estimated_cost: number;
  unit_cost?: number;
  installation_cost?: number;
  maintenance_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AuditLogType = 'all' | 'error' | 'info' | 'update' | 'create' | 'delete';

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by?: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
}