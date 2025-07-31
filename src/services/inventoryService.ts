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

// Inventory Items API
export const inventoryService = {
  // Get inventory summary
  async getSummary(): Promise<InventorySummary> {
    const { data, error } = await supabase.rpc('get_inventory_summary');
    
    if (error) {
      console.error('Error fetching inventory summary:', error);
      throw new Error('Failed to fetch inventory summary');
    }
    
    return data[0] || {
      total_items: 0,
      available_items: 0,
      deployed_items: 0,
      maintenance_items: 0,
      retired_items: 0,
      lost_items: 0,
      damaged_items: 0,
    };
  },

  // Get inventory items with filters
  async getInventoryItems(filters: InventoryFilters = {}, page = 1, limit = 20): Promise<{
    data: InventoryItem[];
    total: number;
    page: number;
    limit: number;
  }> {
    let query = supabase
      .from('inventory_items')
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
    if (filters.manufacturer) {
      query = query.ilike('manufacturer', `%${filters.manufacturer}%`);
    }
    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters.serial_number) {
      query = query.ilike('serial_number', `%${filters.serial_number}%`);
    }

    // Get total count
    const { count } = await query.count();
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items');
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  // Get filtered inventory using the database function
  async getFilteredInventory(filters: InventoryFilters = {}): Promise<FilteredInventoryResponse[]> {
    const { data, error } = await supabase.rpc('get_filtered_inventory', {
      p_sector_id: filters.sector_id || null,
      p_city_id: filters.city_id || null,
      p_site_id: filters.site_id || null,
      p_group_type: filters.group_type || null,
      p_inventory_type: filters.inventory_type || null,
      p_status: filters.status || null,
    });

    if (error) {
      console.error('Error fetching filtered inventory:', error);
      throw new Error('Failed to fetch filtered inventory');
    }

    return data || [];
  },

  // Get inventory by group type
  async getInventoryByGroupType(): Promise<InventoryByGroupType[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('group_type, status')
      .in('status', ['available', 'deployed', 'maintenance']);

    if (error) {
      console.error('Error fetching inventory by group type:', error);
      throw new Error('Failed to fetch inventory by group type');
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

    return grouped || [];
  },

  // Get inventory by type
  async getInventoryByType(): Promise<InventoryByType[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('inventory_type, status')
      .in('status', ['available', 'deployed', 'maintenance']);

    if (error) {
      console.error('Error fetching inventory by type:', error);
      throw new Error('Failed to fetch inventory by type');
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

    return grouped || [];
  },

  // Get inventory by status
  async getInventoryByStatus(): Promise<InventoryByStatus[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('status');

    if (error) {
      console.error('Error fetching inventory by status:', error);
      throw new Error('Failed to fetch inventory by status');
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

    return grouped || [];
  },

  // Create inventory item
  async createInventoryItem(item: CreateInventoryItemForm): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
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
  },

  // Update inventory item
  async updateInventoryItem(id: string, updates: UpdateInventoryItemForm): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
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
  },

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error('Failed to delete inventory item');
    }
  },

  // Deploy inventory item
  async deployInventoryItem(deployment: DeployInventoryForm): Promise<InventoryDeploymentHistory> {
    // Start a transaction
    const { data: history, error: historyError } = await supabase
      .from('inventory_deployment_history')
      .insert([{
        inventory_item_id: deployment.inventory_item_id,
        to_site_id: deployment.to_site_id,
        deployed_by: (await supabase.auth.getUser()).data.user?.id,
        reason: deployment.reason,
        notes: deployment.notes,
      }])
      .select(`
        *,
        inventory_item:inventory_items(*),
        to_site:sites!inventory_deployment_history_to_site_id_fkey(*),
        deployed_by_profile:profiles!inventory_deployment_history_deployed_by_fkey(*)
      `)
      .single();

    if (historyError) {
      console.error('Error creating deployment history:', historyError);
      throw new Error('Failed to create deployment history');
    }

    // Update inventory item status and site
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        status: 'deployed',
        site_id: deployment.to_site_id,
      })
      .eq('id', deployment.inventory_item_id);

    if (updateError) {
      console.error('Error updating inventory item:', updateError);
      throw new Error('Failed to update inventory item');
    }

    return history;
  },

  // Get deployment history
  async getDeploymentHistory(inventoryItemId?: string): Promise<InventoryDeploymentHistory[]> {
    let query = supabase
      .from('inventory_deployment_history')
      .select(`
        *,
        inventory_item:inventory_items(*),
        from_site:sites!inventory_deployment_history_from_site_id_fkey(*),
        to_site:sites!inventory_deployment_history_to_site_id_fkey(*),
        deployed_by_profile:profiles!inventory_deployment_history_deployed_by_fkey(*)
      `);

    if (inventoryItemId) {
      query = query.eq('inventory_item_id', inventoryItemId);
    }

    const { data, error } = await query.order('deployed_at', { ascending: false });

    if (error) {
      console.error('Error fetching deployment history:', error);
      throw new Error('Failed to fetch deployment history');
    }

    return data || [];
  },

  // Create maintenance log
  async createMaintenanceLog(maintenance: MaintenanceLogForm): Promise<InventoryMaintenanceLog> {
    const { data, error } = await supabase
      .from('inventory_maintenance_log')
      .insert([{
        ...maintenance,
        performed_by: (await supabase.auth.getUser()).data.user?.id,
      }])
      .select(`
        *,
        inventory_item:inventory_items(*),
        performed_by_profile:profiles!inventory_maintenance_log_performed_by_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Error creating maintenance log:', error);
      throw new Error('Failed to create maintenance log');
    }

    // Update inventory item maintenance dates
    if (maintenance.next_maintenance_date) {
      await supabase
        .from('inventory_items')
        .update({
          last_maintenance_date: new Date().toISOString(),
          next_maintenance_date: maintenance.next_maintenance_date,
        })
        .eq('id', maintenance.inventory_item_id);
    }

    return data;
  },

  // Get maintenance log
  async getMaintenanceLog(inventoryItemId?: string): Promise<InventoryMaintenanceLog[]> {
    let query = supabase
      .from('inventory_maintenance_log')
      .select(`
        *,
        inventory_item:inventory_items(*),
        performed_by_profile:profiles!inventory_maintenance_log_performed_by_fkey(*)
      `);

    if (inventoryItemId) {
      query = query.eq('inventory_item_id', inventoryItemId);
    }

    const { data, error } = await query.order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance log:', error);
      throw new Error('Failed to fetch maintenance log');
    }

    return data || [];
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
    let query = supabase
      .from('licenses')
      .select(`
        *,
        site:sites(*),
        inventory_item:inventory_items(*)
      `);

    // Apply filters
    if (filters.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.license_type) {
      query = query.eq('license_type', filters.license_type);
    }
    if (filters.vendor) {
      query = query.ilike('vendor', `%${filters.vendor}%`);
    }
    if (filters.expiry_date_from) {
      query = query.gte('expiry_date', filters.expiry_date_from);
    }
    if (filters.expiry_date_to) {
      query = query.lte('expiry_date', filters.expiry_date_to);
    }

    // Get total count
    const { count } = await query.count();
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching licenses:', error);
      throw new Error('Failed to fetch licenses');
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  // Create license
  async createLicense(license: CreateLicenseForm): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .insert([license])
      .select(`
        *,
        site:sites(*),
        inventory_item:inventory_items(*)
      `)
      .single();

    if (error) {
      console.error('Error creating license:', error);
      throw new Error('Failed to create license');
    }

    return data;
  },

  // Update license
  async updateLicense(id: string, updates: Partial<CreateLicenseForm>): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        site:sites(*),
        inventory_item:inventory_items(*)
      `)
      .single();

    if (error) {
      console.error('Error updating license:', error);
      throw new Error('Failed to update license');
    }

    return data;
  },

  // Delete license
  async deleteLicense(id: string): Promise<void> {
    const { error } = await supabase
      .from('licenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting license:', error);
      throw new Error('Failed to delete license');
    }
  },

  // License Management specific methods
  async getLicenseManagementSummary(): Promise<{
    total_licenses: number;
    active_licenses: number;
    expiring_soon: number;
    expired_licenses: number;
    software_licenses: number;
    hardware_licenses: number;
    service_licenses: number;
    integration_licenses: number;
  }> {
    const { data, error } = await supabase.rpc('get_license_management_summary');
    
    if (error) {
      console.error('Error fetching license management summary:', error);
      throw new Error('Failed to fetch license management summary');
    }
    
    return data[0] || {
      total_licenses: 0,
      active_licenses: 0,
      expiring_soon: 0,
      expired_licenses: 0,
      software_licenses: 0,
      hardware_licenses: 0,
      service_licenses: 0,
      integration_licenses: 0,
    };
  },

  async getLicenseManagementItems(filters: any = {}, page = 1, limit = 20): Promise<{
    data: License[];
    total: number;
    page: number;
    limit: number;
  }> {
    let query = supabase
      .from('licenses')
      .select(`
        *,
        site:sites(*, sector:sectors(*), city:cities(*)),
        inventory_item:inventory_items(*)
      `);

    // Apply filters
    if (filters.organisation_id) {
      query = query.eq('site.sector_id', filters.organisation_id);
    }
    if (filters.food_court_id) {
      query = query.eq('site.city_id', filters.food_court_id);
    }
    if (filters.restaurant_id) {
      query = query.eq('site_id', filters.restaurant_id);
    }
    if (filters.license_type) {
      query = query.eq('license_type', filters.license_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.vendor) {
      query = query.ilike('vendor', `%${filters.vendor}%`);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,license_key.ilike.%${filters.search}%`);
    }

    // Get total count
    const { count } = await query.count();
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, error } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching license management items:', error);
      throw new Error('Failed to fetch license management items');
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  async getLicenseByType(): Promise<{
    license_type: string;
    count: number;
    active: number;
    expiring: number;
    expired: number;
  }[]> {
    const { data, error } = await supabase.rpc('get_license_by_type');
    
    if (error) {
      console.error('Error fetching license by type:', error);
      throw new Error('Failed to fetch license by type');
    }
    
    return data || [];
  },

  async getLicenseByStatus(): Promise<{
    status: string;
    count: number;
  }[]> {
    const { data, error } = await supabase.rpc('get_license_by_status');
    
    if (error) {
      console.error('Error fetching license by status:', error);
      throw new Error('Failed to fetch license by status');
    }
    
    return data || [];
  },

  async getLicenseByOrganisation(): Promise<{
    organisation: string;
    count: number;
    active: number;
    expiring: number;
    expired: number;
  }[]> {
    const { data, error } = await supabase.rpc('get_license_by_organisation');
    
    if (error) {
      console.error('Error fetching license by organisation:', error);
      throw new Error('Failed to fetch license by organisation');
    }
    
    return data || [];
  },
};

// Reference Data API
export const referenceDataService = {
  // Get sectors
  async getSectors(): Promise<Sector[]> {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching sectors:', error);
      throw new Error('Failed to fetch sectors');
    }

    return data || [];
  },

  // Get cities
  async getCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching cities:', error);
      throw new Error('Failed to fetch cities');
    }

    return data || [];
  },

  // Get sites
  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select(`
        *,
        sector:sectors(*),
        city:cities(*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching sites:', error);
      throw new Error('Failed to fetch sites');
    }

    return data || [];
  },
}; 