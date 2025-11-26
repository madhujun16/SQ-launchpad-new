// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface SoftwareCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SoftwareModule {
  id: string;
  name: string;
  description: string;
  category_id: string;
  license_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface HardwareItem {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  subcategory?: string;
  manufacturer?: string;
  configuration_notes?: string;
  unit_cost: number;
  quantity?: number;
  total_cost?: number;
  support_type?: string;
  support_cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  category?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface RecommendationRule {
  id: string;
  software_category: string;
  hardware_category: string;
  is_mandatory: boolean;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export const PlatformConfigService = {
  async getSoftwareCategories(): Promise<SoftwareCategory[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getSoftwareModulesByCategories(categories: string[]): Promise<SoftwareModule[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getHardwareItemsByCategories(categories: string[]): Promise<HardwareItem[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getAllActiveSoftwareModules(): Promise<SoftwareModule[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getAllActiveHardwareItems(): Promise<HardwareItem[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getRecommendationRules(categories: string[]): Promise<RecommendationRule[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getAllSoftwareModules(): Promise<SoftwareModule[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async getAllHardwareItems(): Promise<HardwareItem[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  }
};
