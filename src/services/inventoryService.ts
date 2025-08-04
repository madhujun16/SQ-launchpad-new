import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem, InventoryFilters, License } from '@/types/inventory';

export const inventoryService = {
  // Fetch all inventory items with optional filters
  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    let query = supabase
      .from('inventory_items')
      .select(`
        *,
        site:sites(id, name),
        assigned_user:profiles!inventory_items_assigned_to_fkey(id, full_name, email),
        created_by_user:profiles!inventory_items_created_by_fkey(id, full_name, email)
      `);

    // Apply filters
    if (filters?.group_type) {
      query = query.eq('group_type', filters.group_type);
    }
    if (filters?.inventory_type) {
      query = query.eq('inventory_type', filters.inventory_type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.site_id) {
      query = query.eq('site_id', filters.site_id);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.search) {
      query = query.or(`serial_number.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch a single inventory item by ID
  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        site:sites(id, name),
        assigned_user:profiles!inventory_items_assigned_to_fkey(id, full_name, email),
        created_by_user:profiles!inventory_items_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }

    return data;
  },

  // Create a new inventory item
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        serial_number: item.serial_number,
        model: item.model,
        inventory_type: item.inventory_type,
        group_type: item.group_type,
        status: item.status,
        site_id: item.site_id,
        assigned_to: item.assigned_to,
        notes: item.notes,
        purchase_date: item.purchase_date,
        warranty_expiry: item.warranty_expiry,
        created_by: item.created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }

    return data;
  },

  // Update an inventory item
  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        serial_number: updates.serial_number,
        model: updates.model,
        inventory_type: updates.inventory_type,
        group_type: updates.group_type,
        status: updates.status,
        site_id: updates.site_id,
        assigned_to: updates.assigned_to,
        notes: updates.notes,
        purchase_date: updates.purchase_date,
        warranty_expiry: updates.warranty_expiry,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return data;
  },

  // Delete an inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Fetch all licenses
  async getLicenses(): Promise<License[]> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching licenses:', error);
      throw error;
    }

    return data || [];
  },

  // Fetch a single license by ID
  async getLicense(id: string): Promise<License | null> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching license:', error);
      throw error;
    }

    return data;
  },

  // Create a new license
  async createLicense(license: Omit<License, 'id' | 'created_at' | 'updated_at'>): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .insert({
        name: license.name,
        license_key: license.license_key,
        license_type: license.license_type,
        vendor: license.vendor,
        cost: license.cost,
        purchase_date: license.purchase_date,
        expiry_date: license.expiry_date,
        status: license.status,
        notes: license.notes,
        created_by: license.created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating license:', error);
      throw error;
    }

    return data;
  },

  // Update a license
  async updateLicense(id: string, updates: Partial<License>): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .update({
        name: updates.name,
        license_key: updates.license_key,
        license_type: updates.license_type,
        vendor: updates.vendor,
        cost: updates.cost,
        purchase_date: updates.purchase_date,
        expiry_date: updates.expiry_date,
        status: updates.status,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating license:', error);
      throw error;
    }

    return data;
  },

  // Delete a license
  async deleteLicense(id: string): Promise<void> {
    const { error } = await supabase
      .from('licenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting license:', error);
      throw error;
    }
  },

  // Get inventory statistics
  async getInventoryStats() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('status, group_type, inventory_type');

    if (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }

    const items = data || [];
    
    return {
      total: items.length,
      byStatus: {
        available: items.filter(item => item.status === 'available').length,
        deployed: items.filter(item => item.status === 'deployed').length,
        maintenance: items.filter(item => item.status === 'maintenance').length,
        retired: items.filter(item => item.status === 'retired').length,
      },
      byGroupType: {
        hardware: items.filter(item => item.group_type === 'hardware').length,
        software: items.filter(item => item.group_type === 'software').length,
        network: items.filter(item => item.group_type === 'network').length,
        accessories: items.filter(item => item.group_type === 'accessories').length,
      },
      byInventoryType: {
        counter: items.filter(item => item.inventory_type === 'counter').length,
        tablet: items.filter(item => item.inventory_type === 'tablet').length,
        router: items.filter(item => item.inventory_type === 'router').length,
        cable: items.filter(item => item.inventory_type === 'cable').length,
        other: items.filter(item => item.inventory_type === 'other').length,
      },
    };
  },
};