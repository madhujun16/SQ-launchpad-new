import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CategoryService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new category
  async createCategory(name: string, description?: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  },

  // Update a category
  async updateCategory(id: string, name: string, description?: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  },

  // Delete a category (soft delete by setting is_active to false)
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Check if category name already exists
  async categoryExists(name: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking category existence:', error);
      throw error;
    }

    return (data || []).length > 0;
  }
};
