import { supabase } from '@/integrations/supabase/client';
import type { License, CreateLicenseForm, LicenseFilters, Site, Sector, City } from '@/types/inventory';

export const licenseService = {
  // Secure license management with role-based access control
  async getLicenseManagementSummary() {
    try {
      const { data, error } = await supabase.rpc('get_license_summary');
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          total_licenses: 0,
          active_licenses: 0,
          expiring_soon: 0,
          expired_licenses: 0,
          software_licenses: 0,
          hardware_licenses: 0,
          service_licenses: 0,
          integration_licenses: 0,
        };
      }

      const summary = data[0];
      const byType = (summary.by_type as Record<string, number>) || {};
      
      return {
        total_licenses: Number(summary.total_licenses) || 0,
        active_licenses: Number(summary.active_licenses) || 0,
        expiring_soon: Number(summary.expiring_soon) || 0,
        expired_licenses: Number(summary.expired_licenses) || 0,
        software_licenses: Number(byType.software) || 0,
        hardware_licenses: Number(byType.hardware) || 0,
        service_licenses: Number(byType.service) || 0,
        integration_licenses: Number(byType.integration) || 0,
      };
    } catch (error) {
      console.error('Error fetching license summary:', error);
      return {
        total_licenses: 0,
        active_licenses: 0,
        expiring_soon: 0,
        expired_licenses: 0,
        software_licenses: 0,
        hardware_licenses: 0,
        service_licenses: 0,
        integration_licenses: 0,
      };
    }
  },

  async getLicenseManagementItems(filters: Record<string, unknown> = {}, page = 1, limit = 20) {
    try {
      // Use secure function that automatically masks sensitive data based on user role
      const { data, error } = await supabase.rpc('get_licenses_secure', {
        p_limit: limit,
        p_offset: (page - 1) * limit
      });

      if (error) throw error;

      // Get total count for pagination
      const { data: countData, error: countError } = await supabase.rpc('get_licenses_count');
      if (countError) throw countError;

      return {
        data: data || [],
        total: countData || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching license items:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  async getLicenseByType() {
    try {
      // Use secure function to get aggregated data without sensitive information
      const { data, error } = await supabase.rpc('get_licenses_secure', {
        p_limit: 1000, // Get all for aggregation
        p_offset: 0
      });

      if (error) throw error;

      const typeCounts = (data || []).reduce((acc: Record<string, number>, item) => {
        const type = item.license_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error fetching license by type:', error);
      return [];
    }
  },

  async getLicenseByStatus() {
    try {
      const { data, error } = await supabase.rpc('get_licenses_secure', {
        p_limit: 1000,
        p_offset: 0
      });

      if (error) throw error;

      const statusCounts = (data || []).reduce((acc: Record<string, number>, item) => {
        const status = item.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error fetching license by status:', error);
      return [];
    }
  },

  async getLicenseByOrganisation() {
    try {
      const { data, error } = await supabase.rpc('get_licenses_secure', {
        p_limit: 1000,
        p_offset: 0
      });

      if (error) throw error;

      const vendorCounts = (data || []).reduce((acc: Record<string, number>, item) => {
        const vendor = item.vendor || 'unknown';
        acc[vendor] = (acc[vendor] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(vendorCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error fetching license by organization:', error);
      return [];
    }
  },

  // Admin-only functions for sensitive data access
  async getLicenseWithSensitiveData(id: string) {
    try {
      const { data, error } = await supabase.rpc('get_license_with_sensitive_data', {
        license_id: id
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching sensitive license data:', error);
      throw new Error('Access denied: Unable to fetch sensitive license data');
    }
  },

  async createLicense(license: CreateLicenseForm) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .insert([{
          name: license.name,
          license_key: license.license_key,
          license_type: license.license_type,
          status: license.status,
          vendor: license.vendor,
          cost: license.cost,
          purchase_date: license.start_date,
          expiry_date: license.expiry_date,
          notes: license.notes,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating license:', error);
      throw new Error('Failed to create license. Check your permissions.');
    }
  },

  async updateLicense(id: string, updates: Partial<CreateLicenseForm>) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update({
          name: updates.name,
          license_key: updates.license_key,
          license_type: updates.license_type,
          status: updates.status,
          vendor: updates.vendor,
          cost: updates.cost,
          purchase_date: updates.start_date,
          expiry_date: updates.expiry_date,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating license:', error);
      throw new Error('Failed to update license. Check your permissions.');
    }
  },

  async deleteLicense(id: string) {
    try {
      const { error } = await supabase
        .from('licenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting license:', error);
      throw new Error('Failed to delete license. Check your permissions.');
    }
  },
};

export const referenceDataService = {
  async getSectors(): Promise<Sector[]> {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(city => ({ ...city, country: 'United Kingdom' }));
  },

  async getSites(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select(`
        *,
        sector:sectors(*),
        city:cities(*)
      `)
      .order('name');

    if (error) throw error;
    return (data || []).map(site => ({
      ...site,
      city: site.city ? { ...site.city, country: 'United Kingdom' } : undefined
    }));
  },
};