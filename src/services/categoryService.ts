// TODO: Connect to GCP backend APIs
// TODO: All methods need to be reimplemented with GCP APIs

const API_NOT_IMPLEMENTED = 'API not implemented - connect to GCP backend';

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CategoryService = {
  async getCategories(): Promise<Category[]> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async updateCategory(id: string, name: string, description?: string): Promise<Category> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async deleteCategory(id: string): Promise<void> {
    throw new Error(API_NOT_IMPLEMENTED);
  },

  async categoryExists(name: string, excludeId?: string): Promise<boolean> {
    throw new Error(API_NOT_IMPLEMENTED);
  }
};
