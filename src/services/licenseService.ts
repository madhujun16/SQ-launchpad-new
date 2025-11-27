// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import type { License, CreateLicenseForm, Site, Sector, City } from '@/types/inventory';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export const licenseService = {
  async getLicenseManagementSummary() {
    console.warn('License API not implemented - returning empty data');
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
    console.warn('License API not implemented - returning empty data');
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

  async getLicenseWithSensitiveData(id: string) {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async createLicense(license: CreateLicenseForm) {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async updateLicense(id: string, updates: Partial<CreateLicenseForm>) {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async deleteLicense(id: string) {
    throw new Error(API_NOT_IMPLEMENTED);
  },
};

export const referenceDataService = {
  async getSectors(): Promise<Sector[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getCities(): Promise<City[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getSites(): Promise<Site[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },
};
