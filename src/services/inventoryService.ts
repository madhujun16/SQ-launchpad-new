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
    try {
      let query = supabase
        .from('inventory_items' as any)
        .select(`
          *,
          site:sites(*, sector:sectors(*), city:cities(*)),
          assigned_to_profile:profiles!inventory_items_assigned_to_fkey(*)
        `);

      // Apply filters
      if (filters.sector_id) {
        query = query.eq('site.sector_id', filters.sector_id);
      }
      if (filters.city_id) {
        query = query.eq('site.city_id', filters.city_id);
      }
      if (filters.site_id) {
        query = query.eq('site_id', filters.site_id);
      }
      if (filters.group_type) {
        query = query.eq('group_type', filters.group_type);
      }
      if (filters.inventory_type) {
        query = query.eq('inventory_type', filters.inventory_type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.warn('Error fetching inventory items:', error);
        return { data: [], total: 0, page, limit };
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.warn('Inventory items table not available yet:', error);
      return { data: [], total: 0, page, limit };
    }
  },

  // Get filtered inventory using the database function
  async getFilteredInventory(filters: InventoryFilters = {}): Promise<FilteredInventoryResponse[]> {
    try {
      const { data, error } = await supabase.rpc('get_filtered_inventory' as any, {
        p_site_id: filters.site_id || null,
        p_inventory_type: filters.inventory_type || null,
        p_status: filters.status || null,
        p_assigned_to: filters.assigned_to || null,
      });

      if (error) {
        console.warn('Error fetching filtered inventory:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Filtered inventory function not available yet:', error);
      return [];
    }
  },

  // Get inventory by group type
  async getInventoryByGroupType(): Promise<InventoryByGroupType[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('group_type, status')
        .in('status', ['available', 'deployed', 'maintenance']);

      if (error) {
        console.warn('Error fetching inventory by group type:', error);
        return generateMockGroupTypes();
      }

      const grouped = data?.reduce((acc, item) => {
        const existing = acc.find(g => g.group_type === item.group_type);
        if (existing) {
          existing.count++;
          existing[item.status as keyof InventoryByGroupType]++;
        } else {
          acc.push({
            group_type: item.group_type,
            count: 1,
            available: item.status === 'available' ? 1 : 0,
            deployed: item.status === 'deployed' ? 1 : 0,
            maintenance: item.status === 'maintenance' ? 1 : 0,
          });
        }
        return acc;
      }, [] as InventoryByGroupType[]);

      return grouped || generateMockGroupTypes();
    } catch (error) {
      console.warn('Inventory by group type not available yet:', error);
      return generateMockGroupTypes();
    }
  },

  // Get inventory by type
  async getInventoryByType(): Promise<InventoryByType[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('inventory_type, status')
        .in('status', ['available', 'deployed', 'maintenance']);

      if (error) {
        console.warn('Error fetching inventory by type:', error);
        return generateMockInventoryTypes();
      }

      const grouped = data?.reduce((acc, item) => {
        const existing = acc.find(g => g.inventory_type === item.inventory_type);
        if (existing) {
          existing.count++;
          existing[item.status as keyof InventoryByType]++;
        } else {
          acc.push({
            inventory_type: item.inventory_type,
            count: 1,
            available: item.status === 'available' ? 1 : 0,
            deployed: item.status === 'deployed' ? 1 : 0,
            maintenance: item.status === 'maintenance' ? 1 : 0,
          });
        }
        return acc;
      }, [] as InventoryByType[]);

      return grouped || generateMockInventoryTypes();
    } catch (error) {
      console.warn('Inventory by type not available yet:', error);
      return generateMockInventoryTypes();
    }
  },

  // Get inventory by status
  async getInventoryByStatus(): Promise<InventoryByStatus[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('status');

      if (error) {
        console.warn('Error fetching inventory by status:', error);
        return generateMockStatusTypes();
      }

      const grouped = data?.reduce((acc, item) => {
        const existing = acc.find(g => g.status === item.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            status: item.status,
            count: 1,
          });
        }
        return acc;
      }, [] as InventoryByStatus[]);

      return grouped || generateMockStatusTypes();
    } catch (error) {
      console.warn('Inventory by status not available yet:', error);
      return generateMockStatusTypes();
    }
  },

  // Create inventory item
  async createInventoryItem(item: CreateInventoryItemForm): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .insert([item])
        .select(`
          *,
          site:sites(*, sector:sectors(*), city:cities(*)),
          assigned_to_profile:profiles!inventory_items_assigned_to_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error creating inventory item:', error);
        throw new Error('Failed to create inventory item');
      }

      return data;
    } catch (error) {
      console.warn('Create inventory item not available yet:', error);
      throw new Error('Inventory management not available yet');
    }
  },

  // Update inventory item
  async updateInventoryItem(id: string, updates: UpdateInventoryItemForm): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          site:sites(*, sector:sectors(*), city:cities(*)),
          assigned_to_profile:profiles!inventory_items_assigned_to_fkey(*)
        `)
        .single();

      if (error) {
        console.error('Error updating inventory item:', error);
        throw new Error('Failed to update inventory item');
      }

      return data;
    } catch (error) {
      console.warn('Update inventory item not available yet:', error);
      throw new Error('Inventory management not available yet');
    }
  },

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_items' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting inventory item:', error);
        throw new Error('Failed to delete inventory item');
      }
    } catch (error) {
      console.warn('Delete inventory item not available yet:', error);
      throw new Error('Inventory management not available yet');
    }
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
    try {
      const { data, error } = await supabase
        .from('sectors' as any)
        .select('*')
        .order('name');

      if (error) {
        console.warn('Error fetching sectors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Sectors table not available yet:', error);
      return [];
    }
  },

  async getCities(): Promise<City[]> {
    try {
      const { data, error } = await supabase
        .from('cities' as any)
        .select('*')
        .order('name');

      if (error) {
        console.warn('Error fetching cities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Cities table not available yet:', error);
      return [];
    }
  },

  async getSites(): Promise<Site[]> {
    try {
      const { data, error } = await supabase
        .from('sites' as any)
        .select('*')
        .order('name');

      if (error) {
        console.warn('Error fetching sites:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Sites table not available yet:', error);
      return [];
    }
  }
};