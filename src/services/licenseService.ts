import { supabase } from '@/integrations/supabase/client';
import type { License, CreateLicenseForm, LicenseFilters, Site, Sector, City } from '@/types/inventory';

export const licenseService = {
  // Mock implementation for license management since licenses table doesn't exist
  async getLicenseManagementSummary() {
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
  },

  async getLicenseManagementItems(filters: Record<string, unknown> = {}, page = 1, limit = 20) {
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  },

  async getLicenseByType() {
    return [];
  },

  async getLicenseByStatus() {
    return [];
  },

  async getLicenseByOrganisation() {
    return [];
  },

  async createLicense(license: CreateLicenseForm) {
    throw new Error('Licenses table not available');
  },

  async updateLicense(id: string, updates: Partial<CreateLicenseForm>) {
    throw new Error('Licenses table not available');
  },

  async deleteLicense(id: string) {
    throw new Error('Licenses table not available');
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