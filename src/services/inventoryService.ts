// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

import type { InventoryItem, InventoryFilters, License } from '@/types/inventory';

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export const inventoryService = {
  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    // Return empty array until API is implemented
    return [];
  },

  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    return null;
  },

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async deleteInventoryItem(id: string): Promise<void> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getLicenses(): Promise<License[]> {
    return [];
  },

  async getLicense(id: string): Promise<License | null> {
    return null;
  },

  async createLicense(license: Partial<License>): Promise<License> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async updateLicense(id: string, updates: Partial<License>): Promise<License> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async deleteLicense(id: string): Promise<void> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getInventoryStats() {
    return {
      total: 0,
      byStatus: {
        available: 0,
        deployed: 0,
        maintenance: 0,
        retired: 0,
      },
      byGroupType: {
        hardware: 0,
        software: 0,
        network: 0,
        accessories: 0,
      },
      byInventoryType: {
        counter: 0,
        tablet: 0,
        router: 0,
        cable: 0,
        other: 0,
      },
    };
  },
};

// Export services
export { licenseService, referenceDataService } from './licenseService';
