// Category Service - Manages categories for software and hardware
// Uses platform config endpoints for software categories
// For hardware categories, extracts from hardware items or uses software categories

import { apiClient } from './apiClient';
import { PlatformConfigService } from './platformConfigService';

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type?: 'software' | 'hardware'; // Optional type indicator
}

export const CategoryService = {
  /**
   * Get all categories (combines software and hardware categories)
   * Uses dedicated endpoints for both software and hardware categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      // Get software and hardware categories from platform config
      const [softwareCategories, hardwareCategories] = await Promise.all([
        PlatformConfigService.getSoftwareCategories(),
        PlatformConfigService.getHardwareCategories()
      ]);
      
      // Combine software and hardware categories
      const allCategories: Category[] = [
        ...softwareCategories.map(cat => ({ ...cat, type: 'software' as const })),
        ...hardwareCategories.map(cat => ({ ...cat, type: 'hardware' as const }))
      ];
      
      // Remove duplicates by name (prefer software categories if both exist)
      const uniqueCategories = new Map<string, Category>();
      allCategories.forEach(cat => {
        if (!uniqueCategories.has(cat.name)) {
          uniqueCategories.set(cat.name, cat);
        }
      });
      
      return Array.from(uniqueCategories.values());
    } catch (error) {
      console.error('❌ CategoryService.getAllCategories: Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get software categories only
   */
  async getSoftwareCategories(): Promise<Category[]> {
    try {
      const categories = await PlatformConfigService.getSoftwareCategories();
      return categories.map(cat => ({ ...cat, type: 'software' as const }));
    } catch (error) {
      console.error('❌ CategoryService.getSoftwareCategories: Error fetching software categories:', error);
      return [];
    }
  },

  /**
   * Get hardware categories (from dedicated endpoint)
   */
  async getHardwareCategories(): Promise<Category[]> {
    try {
      const categories = await PlatformConfigService.getHardwareCategories();
      return categories.map(cat => ({ ...cat, type: 'hardware' as const }));
    } catch (error) {
      console.error('❌ CategoryService.getHardwareCategories: Error fetching hardware categories:', error);
      return [];
    }
  },

  /**
   * Create a new category
   * Note: You need to specify the type (software or hardware)
   * This will use the appropriate endpoint: /platform/software-categories or /platform/hardware-categories
   */
  async createCategory(name: string, description?: string, type: 'software' | 'hardware' = 'software'): Promise<Category> {
    try {
      const endpoint = type === 'software' 
        ? '/platform/software-categories' 
        : '/platform/hardware-categories';
      
      const response = await apiClient.post<{
        message: string;
        data: Category;
      }>(endpoint, {
        name: name.trim(),
        description: description?.trim(),
        is_active: true
      });
      
      if (response.success && response.data?.data) {
        return { ...response.data.data, type };
      }
      
      throw new Error('Failed to create category');
    } catch (error) {
      console.error('❌ CategoryService.createCategory: Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update a category
   * Note: You need to specify the type (software or hardware)
   */
  async updateCategory(id: string, name: string, description?: string, type: 'software' | 'hardware' = 'software'): Promise<Category> {
    try {
      const endpoint = type === 'software' 
        ? `/platform/software-categories/${id}` 
        : `/platform/hardware-categories/${id}`;
      
      const response = await apiClient.put<{
        message: string;
        data: Category;
      }>(endpoint, {
        name: name.trim(),
        description: description?.trim()
      });
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to update category';
        console.error('❌ CategoryService.updateCategory: Update failed:', {
          id,
          name,
          type,
          endpoint,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return { ...response.data.data, type };
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return { ...response.data as Category, type };
      }
      
      throw new Error('Unexpected response format from backend');
    } catch (error) {
      console.error('❌ CategoryService.updateCategory: Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   * Note: You need to specify the type (software or hardware)
   */
  async deleteCategory(id: string, type: 'software' | 'hardware' = 'software'): Promise<void> {
    try {
      const endpoint = type === 'software' 
        ? `/platform/software-categories/${id}` 
        : `/platform/hardware-categories/${id}`;
      
      const response = await apiClient.delete<{
        message: string;
      }>(endpoint);
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to delete category';
        console.error('❌ CategoryService.deleteCategory: Delete failed:', {
          id,
          type,
          endpoint,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ CategoryService.deleteCategory: Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Archive/Unarchive a category (toggle is_active)
   * Note: You need to specify the type (software or hardware)
   */
  async archiveCategory(id: string, archive: boolean, type: 'software' | 'hardware' = 'software'): Promise<Category> {
    try {
      const endpoint = type === 'software' 
        ? `/platform/software-categories/${id}` 
        : `/platform/hardware-categories/${id}`;
      
      const response = await apiClient.put<{
        message: string;
        data: Category;
      }>(endpoint, {
        is_active: !archive // archive=true means is_active=false
      });
      
      if (!response.success) {
        const errorMsg = response.error?.message || 'Failed to archive category';
        console.error('❌ CategoryService.archiveCategory: Archive failed:', {
          id,
          archive,
          type,
          endpoint,
          error: response.error,
          statusCode: response.error?.statusCode,
          message: errorMsg
        });
        throw new Error(errorMsg);
      }
      
      if (response.data?.data) {
        return { ...response.data.data, type };
      }
      
      // Handle case where backend returns data directly (not nested)
      if (response.data && 'id' in response.data) {
        return { ...response.data as Category, type };
      }
      
      throw new Error('Unexpected response format from backend');
    } catch (error) {
      console.error('❌ CategoryService.archiveCategory: Error archiving category:', error);
      throw error;
    }
  },

  /**
   * Check if a category exists by name
   */
  async categoryExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.some(
        cat => cat.name.toLowerCase() === name.toLowerCase().trim() && 
        (!excludeId || cat.id !== excludeId)
      );
    } catch (error) {
      console.error('❌ CategoryService.categoryExists: Error checking category existence:', error);
      return false;
    }
  }
};
