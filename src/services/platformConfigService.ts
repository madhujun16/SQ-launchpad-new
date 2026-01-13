// Platform Configuration Service - Fetches software/hardware categories and items from backend

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

export interface SoftwareCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HardwareCategory {
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
  /**
   * Get all software categories
   * Backend endpoint: GET /api/platform/software-categories
   */
  async getSoftwareCategories(): Promise<SoftwareCategory[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: SoftwareCategory[];
      }>('/platform/software-categories');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getSoftwareCategories: Error fetching software categories:', error);
      // Return empty array instead of throwing - allows UI to continue
      return [];
    }
  },

  /**
   * Get all hardware categories
   * Backend endpoint: GET /api/platform/hardware-categories
   */
  async getHardwareCategories(): Promise<HardwareCategory[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: HardwareCategory[];
      }>('/platform/hardware-categories');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getHardwareCategories: Error fetching hardware categories:', error);
      // Return empty array instead of throwing - allows UI to continue
      return [];
    }
  },

  /**
   * Get software modules by category IDs
   * Backend endpoint: GET /api/platform/software-modules?category_ids=1,2,3
   */
  async getSoftwareModulesByCategories(categories: string[]): Promise<SoftwareModule[]> {
    try {
      const categoryIds = categories.join(',');
      const response = await apiClient.get<{
        message: string;
        data: SoftwareModule[];
      }>(`/platform/software-modules?category_ids=${categoryIds}`);
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getSoftwareModulesByCategories: Error fetching software modules:', error);
      return [];
    }
  },

  /**
   * Get hardware items by category IDs
   * Backend endpoint: GET /api/platform/hardware-items?category_ids=1,2,3
   */
  async getHardwareItemsByCategories(categories: string[]): Promise<HardwareItem[]> {
    try {
      const categoryIds = categories.join(',');
      const response = await apiClient.get<{
        message: string;
        data: HardwareItem[];
      }>(`/platform/hardware-items?category_ids=${categoryIds}`);
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getHardwareItemsByCategories: Error fetching hardware items:', error);
      return [];
    }
  },

  /**
   * Get all active software modules
   * Backend endpoint: GET /api/platform/software-modules?is_active=true
   */
  async getAllActiveSoftwareModules(): Promise<SoftwareModule[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: SoftwareModule[];
      }>('/platform/software-modules?is_active=true');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getAllActiveSoftwareModules: Error fetching software modules:', error);
      return [];
    }
  },

  /**
   * Get all active hardware items
   * Backend endpoint: GET /api/platform/hardware-items?is_active=true
   */
  async getAllActiveHardwareItems(): Promise<HardwareItem[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: HardwareItem[];
      }>('/platform/hardware-items?is_active=true');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getAllActiveHardwareItems: Error fetching hardware items:', error);
      return [];
    }
  },

  /**
   * Get recommendation rules for categories
   * Backend endpoint: GET /api/platform/recommendation-rules?category_ids=1,2,3
   */
  async getRecommendationRules(categories: string[]): Promise<RecommendationRule[]> {
    try {
      const categoryIds = categories.join(',');
      const response = await apiClient.get<{
        message: string;
        data: RecommendationRule[];
      }>(`/platform/recommendation-rules?category_ids=${categoryIds}`);
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getRecommendationRules: Error fetching recommendation rules:', error);
      return [];
    }
  },

  /**
   * Get all recommendation rules
   * Backend endpoint: GET /api/platform/recommendation-rules
   */
  async getAllRecommendationRules(): Promise<RecommendationRule[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: RecommendationRule[];
      }>('/platform/recommendation-rules');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getAllRecommendationRules: Error fetching recommendation rules:', error);
      return [];
    }
  },

  /**
   * Create a new recommendation rule
   * Backend endpoint: POST /api/platform/recommendation-rules
   */
  async createRecommendationRule(data: {
    software_category: string;
    hardware_category: string;
    is_mandatory: boolean;
    quantity: number;
  }): Promise<RecommendationRule | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: RecommendationRule;
      }>('/platform/recommendation-rules', data);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to create recommendation rule';
        console.error('❌ PlatformConfigService.createRecommendationRule: Create failed:', {
          data,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return response.data.data;
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return response.data as RecommendationRule;
      }
      
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.createRecommendationRule: Error creating recommendation rule:', error);
      throw error;
    }
  },

  /**
   * Update an existing recommendation rule
   * Backend endpoint: PUT /api/platform/recommendation-rules/:id
   */
  async updateRecommendationRule(id: string, data: {
    software_category?: string;
    hardware_category?: string;
    is_mandatory?: boolean;
    quantity?: number;
  }): Promise<RecommendationRule | null> {
    try {
      const response = await apiClient.put<{
        message: string;
        data: RecommendationRule;
      }>(`/platform/recommendation-rules/${id}`, data);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to update recommendation rule';
        console.error('❌ PlatformConfigService.updateRecommendationRule: Update failed:', {
          id,
          data,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return response.data.data;
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return response.data as RecommendationRule;
      }
      
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.updateRecommendationRule: Error updating recommendation rule:', error);
      throw error;
    }
  },

  /**
   * Delete a recommendation rule
   * Backend endpoint: DELETE /api/platform/recommendation-rules/:id
   */
  async deleteRecommendationRule(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{
        message: string;
      }>(`/platform/recommendation-rules/${id}`);
      
      if (!response.success) {
        // Get detailed error information
        const errorMsg = response.error?.message || 'Failed to delete recommendation rule';
        const statusCode = response.error?.statusCode;
        const errorCode = response.error?.code;
        const errorDetails = response.error?.details;
        
        console.error('❌ PlatformConfigService.deleteRecommendationRule: Delete failed:', {
          id,
          statusCode,
          errorCode,
          errorMessage: errorMsg,
          errorDetails: errorDetails,
          fullError: response.error
        });
        
        // For 500 errors, provide more context
        if (statusCode === 500) {
          const detailedMsg = errorDetails?.message || errorMsg;
          throw new Error(`Server error: ${detailedMsg}. Please check backend logs for details.`);
        }
        
        throw new Error(errorMsg);
      }
      
      return true;
    } catch (error) {
      console.error('❌ PlatformConfigService.deleteRecommendationRule: Error deleting recommendation rule:', error);
      throw error;
    }
  },

  /**
   * Get all software modules (active and inactive)
   * Backend endpoint: GET /api/platform/software-modules
   */
  async getAllSoftwareModules(): Promise<SoftwareModule[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: SoftwareModule[];
      }>('/platform/software-modules');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getAllSoftwareModules: Error fetching software modules:', error);
      return [];
    }
  },

  /**
   * Get all hardware items (active and inactive)
   * Backend endpoint: GET /api/platform/hardware-items
   */
  async getAllHardwareItems(): Promise<HardwareItem[]> {
    try {
      const response = await apiClient.get<{
        message: string;
        data: HardwareItem[];
      }>('/platform/hardware-items');
      
      if (response.success && response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    } catch (error) {
      console.error('❌ PlatformConfigService.getAllHardwareItems: Error fetching hardware items:', error);
      return [];
    }
  },

  /**
   * Create a new software module
   * Backend endpoint: POST /api/platform/software-modules
   */
  async createSoftwareModule(data: {
    name: string;
    description?: string;
    category_id: string;
    license_fee: number;
    is_active?: boolean;
  }): Promise<SoftwareModule | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: SoftwareModule;
      }>('/platform/software-modules', data);
      
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.createSoftwareModule: Error creating software module:', error);
      throw error;
    }
  },

  /**
   * Update an existing software module
   * Backend endpoint: PUT /api/platform/software-modules/:id
   */
  async updateSoftwareModule(id: string, data: {
    name?: string;
    description?: string;
    category_id?: string;
    license_fee?: number;
    is_active?: boolean;
  }): Promise<SoftwareModule | null> {
    try {
      const response = await apiClient.put<{
        message: string;
        data: SoftwareModule;
      }>(`/platform/software-modules/${id}`, data);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to update software module';
        console.error('❌ PlatformConfigService.updateSoftwareModule: Update failed:', {
          id,
          data,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return response.data.data;
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return response.data as SoftwareModule;
      }
      
      console.warn('⚠️ PlatformConfigService.updateSoftwareModule: Unexpected response format:', response.data);
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.updateSoftwareModule: Error updating software module:', error);
      throw error;
    }
  },

  /**
   * Delete a software module
   * Backend endpoint: DELETE /api/platform/software-modules/:id
   */
  async deleteSoftwareModule(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{
        message: string;
      }>(`/platform/software-modules/${id}`);
      
      if (!response.success) {
        // Get detailed error information
        const errorMsg = response.error?.message || 'Failed to delete software module';
        const statusCode = response.error?.statusCode;
        const errorCode = response.error?.code;
        const errorDetails = response.error?.details;
        
        console.error('❌ PlatformConfigService.deleteSoftwareModule: Delete failed:', {
          id,
          statusCode,
          errorCode,
          errorMessage: errorMsg,
          errorDetails: errorDetails,
          fullError: response.error
        });
        
        // For 500 errors, provide more context
        if (statusCode === 500) {
          const detailedMsg = errorDetails?.message || errorMsg;
          throw new Error(`Server error: ${detailedMsg}. Please check backend logs for details.`);
        }
        
        throw new Error(errorMsg);
      }
      
      return true;
    } catch (error) {
      console.error('❌ PlatformConfigService.deleteSoftwareModule: Error deleting software module:', error);
      throw error;
    }
  },

  /**
   * Archive/Unarchive a software module
   * Backend endpoint: PUT /api/platform/software-modules/:id/archive or PUT /api/platform/software-modules/:id/unarchive
   */
  async archiveSoftwareModule(id: string, archive: boolean): Promise<boolean> {
    try {
      const endpoint = archive ? `/platform/software-modules/${id}/archive` : `/platform/software-modules/${id}/unarchive`;
      const response = await apiClient.put<{
        message: string;
      }>(endpoint);
      
      return response.success;
    } catch (error) {
      console.error('❌ PlatformConfigService.archiveSoftwareModule: Error archiving software module:', error);
      throw error;
    }
  },

  /**
   * Create a new hardware item
   * Backend endpoint: POST /api/platform/hardware-items
   */
  async createHardwareItem(data: {
    name: string;
    description?: string;
    category_id: string;
    subcategory?: string;
    manufacturer?: string;
    configuration_notes?: string;
    unit_cost: number;
    support_type?: string;
    support_cost?: number;
    is_active?: boolean;
  }): Promise<HardwareItem | null> {
    try {
      const response = await apiClient.post<{
        message: string;
        data: HardwareItem;
      }>('/platform/hardware-items', data);
      
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.createHardwareItem: Error creating hardware item:', error);
      throw error;
    }
  },

  /**
   * Update an existing hardware item
   * Backend endpoint: PUT /api/platform/hardware-items/:id
   */
  async updateHardwareItem(id: string, data: {
    name?: string;
    description?: string;
    category_id?: string;
    subcategory?: string;
    manufacturer?: string;
    configuration_notes?: string;
    unit_cost?: number;
    support_type?: string;
    support_cost?: number;
    is_active?: boolean;
  }): Promise<HardwareItem | null> {
    try {
      const response = await apiClient.put<{
        message: string;
        data: HardwareItem;
      }>(`/platform/hardware-items/${id}`, data);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to update hardware item';
        console.error('❌ PlatformConfigService.updateHardwareItem: Update failed:', {
          id,
          data,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return response.data.data;
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return response.data as HardwareItem;
      }
      
      console.warn('⚠️ PlatformConfigService.updateHardwareItem: Unexpected response format:', response.data);
      return null;
    } catch (error) {
      console.error('❌ PlatformConfigService.updateHardwareItem: Error updating hardware item:', error);
      throw error;
    }
  },

  /**
   * Delete a hardware item
   * Backend endpoint: DELETE /api/platform/hardware-items/:id
   */
  async deleteHardwareItem(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{
        message: string;
      }>(`/platform/hardware-items/${id}`);
      
      if (!response.success) {
        // Get detailed error information
        const errorMsg = response.error?.message || 'Failed to delete hardware item';
        const statusCode = response.error?.statusCode;
        const errorCode = response.error?.code;
        const errorDetails = response.error?.details;
        
        console.error('❌ PlatformConfigService.deleteHardwareItem: Delete failed:', {
          id,
          statusCode,
          errorCode,
          errorMessage: errorMsg,
          errorDetails: errorDetails,
          fullError: response.error
        });
        
        // For 500 errors, provide more context
        if (statusCode === 500) {
          const detailedMsg = errorDetails?.message || errorMsg;
          throw new Error(`Server error: ${detailedMsg}. Please check backend logs for details.`);
        }
        
        throw new Error(errorMsg);
      }
      
      return true;
    } catch (error) {
      console.error('❌ PlatformConfigService.deleteHardwareItem: Error deleting hardware item:', error);
      throw error;
    }
  },

  /**
   * Archive/Unarchive a hardware item
   * Backend endpoint: PUT /api/platform/hardware-items/:id/archive or PUT /api/platform/hardware-items/:id/unarchive
   */
  async archiveHardwareItem(id: string, archive: boolean): Promise<boolean> {
    try {
      const endpoint = archive ? `/platform/hardware-items/${id}/archive` : `/platform/hardware-items/${id}/unarchive`;
      const response = await apiClient.put<{
        message: string;
      }>(endpoint);
      
      return response.success;
    } catch (error) {
      console.error('❌ PlatformConfigService.archiveHardwareItem: Error archiving hardware item:', error);
      throw error;
    }
  }
};
