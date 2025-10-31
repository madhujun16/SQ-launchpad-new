import { supabase } from '@/integrations/supabase/client';

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
  category_id: string; // Changed to category_id to match database
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
  name: string; // Changed back to 'name' to match actual table
  description?: string;
  category_id: string; // Changed to category_id to match database
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
  // Get all software categories
  async getSoftwareCategories(): Promise<SoftwareCategory[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching software categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSoftwareCategories:', error);
      return [];
    }
  },

  // Get software modules by categories (by category_id)
  async getSoftwareModulesByCategories(categories: string[]): Promise<SoftwareModule[]> {
    try {
      if (categories.length === 0) return [];

      const { data, error } = await supabase
        .from('software_modules')
        .select('*')
        .in('category_id', categories)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching software modules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSoftwareModulesByCategories:', error);
      return [];
    }
  },

  // Get hardware items by categories (by category_id)
  async getHardwareItemsByCategories(categories: string[]): Promise<HardwareItem[]> {
    try {
      if (categories.length === 0) return [];

      const { data, error } = await supabase
        .from('hardware_items')
        .select('*')
        .in('category_id', categories)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching hardware items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getHardwareItemsByCategories:', error);
      return [];
    }
  },

  // Get all active software modules for scoping
  async getAllActiveSoftwareModules(): Promise<SoftwareModule[]> {
    try {
      console.log('🔍 Fetching all active software modules...');
      const { data, error } = await supabase
        .from('software_modules')
        .select(`
          *,
          category:categories(id, name, description)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching all active software modules:', error);
        throw error;
      }

      console.log('✅ Software modules fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllActiveSoftwareModules:', error);
      return [];
    }
  },

  // Get all active hardware items for scoping
  async getAllActiveHardwareItems(): Promise<HardwareItem[]> {
    try {
      console.log('🔍 Fetching all active hardware items...');
      const { data, error } = await supabase
        .from('hardware_items')
        .select(`
          *,
          category:categories(id, name, description)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching all active hardware items:', error);
        throw error;
      }

      console.log('✅ Hardware items fetched successfully:', data);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllActiveHardwareItems:', error);
      return [];
    }
  },

  // Get recommendation rules for software categories
  async getRecommendationRules(categories: string[]): Promise<RecommendationRule[]> {
    try {
      if (categories.length === 0) return [];

      const { data, error } = await supabase
        .from('recommendation_rules')
        .select('*')
        .in('software_category', categories);

      if (error) {
        console.error('Error fetching recommendation rules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecommendationRules:', error);
      return [];
    }
  },

  // Get all software modules (for admin management)
  async getAllSoftwareModules(): Promise<SoftwareModule[]> {
    try {
      const { data, error } = await supabase
        .from('software_modules')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching all software modules:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSoftwareModules:', error);
      return [];
    }
  },

  // Get all hardware items (for admin management)
  async getAllHardwareItems(): Promise<HardwareItem[]> {
    try {
      const { data, error } = await supabase
        .from('hardware_items')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching all hardware items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllHardwareItems:', error);
      return [];
    }
  }
};
