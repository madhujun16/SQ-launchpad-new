import { supabase } from '@/integrations/supabase/client';
import {
  InventoryItem,
  InventoryFilters,
  InventorySummary,
  CreateInventoryItemForm,
  UpdateInventoryItemForm,
  License,
  LicenseFilters,
  CreateLicenseForm,
  InventoryDeploymentHistory,
  InventoryMaintenanceLog,
  DeployInventoryForm,
  MaintenanceLogForm,
  FilteredInventoryResponse,
  Sector,
  City,
  Site,
  InventoryByGroupType,
  InventoryByType,
  InventoryByStatus,
} from '@/types/inventory';

// Mock data generators for when tables don't exist
const generateMockSummary = (): InventorySummary => ({
  total_items: 0,
  available_items: 0,
  deployed_items: 0,
  maintenance_items: 0,
  retired_items: 0,
  lost_items: 0,
  damaged_items: 0,
});

const generateMockGroupTypes = (): InventoryByGroupType[] => [
  { group_type: 'POS', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { group_type: 'KMS', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { group_type: 'KIOSK', count: 0, available: 0, deployed: 0, maintenance: 0 },
];

const generateMockInventoryTypes = (): InventoryByType[] => [
  { inventory_type: 'pos_machine', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'ped', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'kiosk', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'cash_drawer', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'printer', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'kds_screen', count: 0, available: 0, deployed: 0, maintenance: 0 },
  { inventory_type: 'kitchen_printer', count: 0, available: 0, deployed: 0, maintenance: 0 },
];

const generateMockStatusTypes = (): InventoryByStatus[] => [
  { status: 'available', count: 0 },
  { status: 'deployed', count: 0 },
  { status: 'maintenance', count: 0 },
  { status: 'retired', count: 0 },
];

// Type guard for checking if data is valid
const isValidArray = (data: any): data is any[] => {
  return Array.isArray(data) && data.every(item => item && typeof item === 'object' && !('error' in item));
};

// Inventory Items API
export const inventoryService = {
  // Get inventory summary
  async getSummary(): Promise<InventorySummary> {
    try {
      // Try to use the function, but fall back to mock if not available
      const { data, error } = await supabase.rpc('get_inventory_summary' as any);
      
      if (error) {
        console.warn('get_inventory_summary function not available yet:', error);
        return generateMockSummary();
      }
      
      return data?.[0] || generateMockSummary();
    } catch (error) {
      console.warn('Inventory summary function not available yet:', error);
      return generateMockSummary();
    }
  },

  // Get inventory items with filters
  async getInventoryItems(filters: InventoryFilters = {}, page = 1, limit = 20): Promise<{
    data: InventoryItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.warn('Inventory items not available yet - tables being created');
    return { data: [], total: 0, page, limit };
  },

  // Get filtered inventory using the database function
  async getFilteredInventory(filters: InventoryFilters = {}): Promise<FilteredInventoryResponse[]> {
    console.warn('Filtered inventory not available yet - tables being created');
    return [];
  },

  // Get inventory by group type
  async getInventoryByGroupType(): Promise<InventoryByGroupType[]> {
    console.warn('Inventory by group type not available yet - tables being created');
    return generateMockGroupTypes();
  },

  // Get inventory by type
  async getInventoryByType(): Promise<InventoryByType[]> {
    console.warn('Inventory by type not available yet - tables being created');
    return generateMockInventoryTypes();
  },

  // Get inventory by status
  async getInventoryByStatus(): Promise<InventoryByStatus[]> {
    console.warn('Inventory by status not available yet - tables being created');
    return generateMockStatusTypes();
  },

  // Create inventory item
  async createInventoryItem(item: CreateInventoryItemForm): Promise<InventoryItem> {
    console.warn('Create inventory item not available yet - tables being created');
    throw new Error('Inventory management not available yet - database tables are being created');
  },

  // Update inventory item
  async updateInventoryItem(id: string, updates: UpdateInventoryItemForm): Promise<InventoryItem> {
    console.warn('Update inventory item not available yet - tables being created');
    throw new Error('Inventory management not available yet - database tables are being created');
  },

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    console.warn('Delete inventory item not available yet - tables being created');
    throw new Error('Inventory management not available yet - database tables are being created');
  },

  // Deploy inventory item
  async deployInventoryItem(deployment: DeployInventoryForm): Promise<InventoryDeploymentHistory> {
    console.warn('Deploy inventory item not available yet');
    throw new Error('Deployment functionality not available yet');
  },

  // Get deployment history
  async getDeploymentHistory(inventoryItemId?: string): Promise<InventoryDeploymentHistory[]> {
    console.warn('Deployment history not available yet');
    return [];
  },

  // Create maintenance log
  async createMaintenanceLog(maintenance: MaintenanceLogForm): Promise<InventoryMaintenanceLog> {
    console.warn('Maintenance log not available yet');
    throw new Error('Maintenance functionality not available yet');
  },

  // Get maintenance log
  async getMaintenanceLog(inventoryItemId?: string): Promise<InventoryMaintenanceLog[]> {
    console.warn('Maintenance log not available yet');
    return [];
  },
};

// Licenses API
export const licenseService = {
  // Get license management summary
  async getLicenseManagementSummary(): Promise<any> {
    console.warn('License summary not available yet');
    return {
      total_licenses: 0,
      active_licenses: 0,
      expired_licenses: 0,
      pending_renewal: 0,
    };
  },

  // Get license management items
  async getLicenseManagementItems(filters: any = {}, page = 1, limit = 20): Promise<{
    data: License[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.warn('License management items not available yet');
    return { data: [], total: 0, page, limit };
  },

  // Get license by type
  async getLicenseByType(): Promise<any[]> {
    console.warn('License by type not available yet');
    return [];
  },

  // Get license by status
  async getLicenseByStatus(): Promise<any[]> {
    console.warn('License by status not available yet');
    return [];
  },

  // Get license by organisation
  async getLicenseByOrganisation(): Promise<any[]> {
    console.warn('License by organisation not available yet');
    return [];
  },

  // Get licenses with filters
  async getLicenses(filters: LicenseFilters = {}, page = 1, limit = 20): Promise<{
    data: License[];
    total: number;
    page: number;
    limit: number;
  }> {
    console.warn('License service not available yet');
    return { data: [], total: 0, page, limit };
  },

  // Create license
  async createLicense(license: CreateLicenseForm): Promise<License> {
    console.warn('Create license not available yet');
    throw new Error('License management not available yet');
  },

  // Update license
  async updateLicense(id: string, updates: Partial<CreateLicenseForm>): Promise<License> {
    console.warn('Update license not available yet');
    throw new Error('License management not available yet');
  },

  // Delete license
  async deleteLicense(id: string): Promise<void> {
    console.warn('Delete license not available yet');
    throw new Error('License management not available yet');
  },
};

// Reference data service
export const referenceDataService = {
  async getSectors(): Promise<Sector[]> {
    console.warn('Sectors not available yet - tables being created');
    return [];
  },

  async getCities(): Promise<City[]> {
    console.warn('Cities not available yet - tables being created');
    return [];
  },

  async getSites(): Promise<Site[]> {
    console.warn('Sites not available yet - tables being created');
    return [];
  }
};