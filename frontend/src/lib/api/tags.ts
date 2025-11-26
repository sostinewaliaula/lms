import apiClient from './client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  courses_count?: number;
  created_at: string;
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get('/tags');
  return response.data.tags || response.data;
};

export const createTag = async (data: Partial<Tag>): Promise<Tag> => {
  const response = await apiClient.post('/tags', data);
  return response.data.tag;
};

export const updateTag = async (id: string, data: Partial<Tag>): Promise<Tag> => {
  const response = await apiClient.put(`/tags/${id}`, data);
  return response.data.tag;
};

export const deleteTag = async (id: string): Promise<void> => {
  await apiClient.delete(`/tags/${id}`);
};


