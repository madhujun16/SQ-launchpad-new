// Inventory Management Types for SmartQ LaunchPad

export type InventoryType = 'counter' | 'tablet' | 'router' | 'cable' | 'other';

export type GroupType = 'hardware' | 'software' | 'network' | 'accessories';

export type InventoryStatus = 'available' | 'deployed' | 'maintenance' | 'retired';

export type LicenseStatus = 
  | 'active'
  | 'expired'
  | 'pending_renewal'
  | 'suspended';

export type MaintenanceType = 'preventive' | 'corrective' | 'upgrade';

export type LicenseType = 'hardware' | 'software' | 'service';

// Base entities
export interface Sector {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  region?: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  food_court_unit: string; // This is the constant Food Court (unit)
  sector_id?: string;
  city_id?: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Joined fields
  sector?: Sector;
  city?: City;
}

export interface InventoryItem {
  id: string;
  serial_number: string;
  model: string;
  inventory_type: InventoryType;
  group_type: GroupType;
  status: InventoryStatus;
  site_id?: string;
  assigned_to?: string;
  notes?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Related data
  site?: {
    id: string;
    name: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  created_by_user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface License {
  id: string;
  name: string;
  license_key?: string;
  license_type?: string;
  vendor?: string;
  cost?: number;
  purchase_date?: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InventoryDeploymentHistory {
  id: string;
  inventory_item_id: string;
  from_site_id?: string;
  to_site_id: string;
  deployed_by: string;
  deployed_at: string;
  reason?: string;
  notes?: string;
  // Joined fields
  inventory_item?: InventoryItem;
  from_site?: Site;
  to_site?: Site;
  deployed_by_profile?: Profile;
}

export interface InventoryMaintenanceLog {
  id: string;
  inventory_item_id: string;
  maintenance_type: MaintenanceType;
  description: string;
  performed_by?: string;
  performed_at: string;
  cost?: number;
  next_maintenance_date?: string;
  notes?: string;
  // Joined fields
  inventory_item?: InventoryItem;
  performed_by_profile?: Profile;
}

// Filter interfaces
export interface InventoryFilters {
  group_type?: GroupType;
  inventory_type?: InventoryType;
  status?: InventoryStatus;
  site_id?: string;
  assigned_to?: string;
  search?: string;
}

export interface LicenseFilters {
  site_id?: string;
  status?: LicenseStatus;
  license_type?: LicenseType;
  vendor?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
}

// Summary interfaces
export interface InventorySummary {
  total_items: number;
  available_items: number;
  deployed_items: number;
  maintenance_items: number;
  retired_items: number;
  lost_items: number;
  damaged_items: number;
}

export interface InventoryByGroupType {
  group_type: GroupType;
  count: number;
  available: number;
  deployed: number;
  maintenance: number;
}

export interface InventoryByType {
  inventory_type: InventoryType;
  count: number;
  available: number;
  deployed: number;
  maintenance: number;
}

export interface InventoryByStatus {
  status: InventoryStatus;
  count: number;
}

// Form interfaces
export interface CreateInventoryItemForm {
  serial_number: string;
  model: string;
  manufacturer?: string;
  inventory_type: InventoryType;
  group_type: GroupType;
  status: InventoryStatus;
  site_id?: string;
  assigned_to?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
}

export interface UpdateInventoryItemForm {
  id: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  inventory_type?: InventoryType;
  group_type?: GroupType;
  status?: InventoryStatus;
  site_id?: string;
  assigned_to?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
}

export interface CreateLicenseForm {
  name: string;
  license_key?: string;
  license_type: LicenseType;
  status: LicenseStatus;
  start_date: string;
  expiry_date?: string;
  renewal_date?: string;
  cost?: number;
  vendor?: string;
  site_id?: string;
  inventory_item_id?: string;
  notes?: string;
}

export interface DeployInventoryForm {
  inventory_item_id: string;
  to_site_id: string;
  quantity_per_counter?: number;
  melford_order_status?: string;
  dispatch_date?: string;
  delivery_date?: string;
  installed_date?: string;
  installer_name?: string;
  asset_tag?: string;
  reason?: string;
  notes?: string;
}

export interface MaintenanceLogForm {
  inventory_item_id: string;
  maintenance_type: MaintenanceType;
  description: string;
  cost?: number;
  next_maintenance_date?: string;
  notes?: string;
}

// API Response interfaces
export interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  summary: InventorySummary;
}

export interface FilteredInventoryResponse {
  id: string;
  serial_number: string;
  model: string;
  manufacturer?: string;
  inventory_type: InventoryType;
  group_type: GroupType;
  status: InventoryStatus;
  site_name?: string;
  sector_name?: string;
  city_name?: string;
  assigned_to_name?: string;
  purchase_date?: string;
  warranty_expiry?: string;
}

// Chart data interfaces
export interface InventoryChartData {
  name: string;
  value: number;
  color?: string;
}

export interface InventoryTrendData {
  date: string;
  total: number;
  available: number;
  deployed: number;
  maintenance: number;
}

// Export interfaces
export interface InventoryExportOptions {
  format: 'json' | 'excel' | 'csv';
  filters?: InventoryFilters;
  include_history?: boolean;
  include_maintenance?: boolean;
}

// Profile interface (from existing types)
export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  invited_at?: string;
  invited_by?: string;
  created_at: string;
  updated_at: string;
}

// Constants
export const INVENTORY_TYPES: { value: InventoryType; label: string }[] = [
  { value: 'counter', label: 'Counter' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'router', label: 'Router' },
  { value: 'cable', label: 'Cable' },
  { value: 'other', label: 'Other' },
];

export const GROUP_TYPES: { value: GroupType; label: string }[] = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' },
  { value: 'accessories', label: 'Accessories' },
];

export const INVENTORY_STATUSES: { value: InventoryStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'deployed', label: 'Deployed', color: 'bg-green-100 text-green-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'retired', label: 'Retired', color: 'bg-gray-100 text-gray-800' },
];

// Backwards compatibility aliases
export const INVENTORY_STATUS_OPTIONS = INVENTORY_STATUSES;
export const INVENTORY_TYPE_OPTIONS = INVENTORY_TYPES;
export const GROUP_TYPE_OPTIONS = GROUP_TYPES;

export const getInventoryTypeLabel = (type: InventoryType): string => {
  return INVENTORY_TYPES.find(t => t.value === type)?.label || type;
};

export const getGroupTypeLabel = (type: GroupType): string => {
  return GROUP_TYPES.find(t => t.value === type)?.label || type;
};

export const getInventoryStatusLabel = (status: InventoryStatus): string => {
  return INVENTORY_STATUSES.find(s => s.value === status)?.label || status;
};

export const getInventoryStatusColor = (status: InventoryStatus): string => {
  return INVENTORY_STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
};

export const LICENSE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'expired', label: 'Expired', color: 'red' },
  { value: 'pending_renewal', label: 'Pending Renewal', color: 'yellow' },
  { value: 'suspended', label: 'Suspended', color: 'orange' },
] as const;

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: 'preventive', label: 'Preventive Maintenance' },
  { value: 'corrective', label: 'Corrective Maintenance' },
  { value: 'upgrade', label: 'Upgrade' },
] as const;

export const LICENSE_TYPE_OPTIONS = [
  { value: 'hardware', label: 'Hardware License' },
  { value: 'software', label: 'Software License' },
  { value: 'service', label: 'Service License' },
] as const; 