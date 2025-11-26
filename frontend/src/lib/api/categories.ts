import apiClient from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  return response.data.categories;
};

export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data.category;
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await apiClient.post('/categories', data);
  return response.data.category;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await apiClient.put(`/categories/${id}`, data);
  return response.data.category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};


