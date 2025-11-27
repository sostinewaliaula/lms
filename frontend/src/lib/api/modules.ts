import apiClient from './client';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  content_items?: ContentItem[];
}

export interface ContentItem {
  id: string;
  module_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index: number;
  is_preview: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export const getModules = async (courseId: string): Promise<Module[]> => {
  const response = await apiClient.get(`/content/modules/${courseId}`);
  return response.data.modules || [];
};

export const createModule = async (data: {
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}): Promise<Module> => {
  const response = await apiClient.post('/content/modules', data);
  return response.data.module;
};

export const updateModule = async (id: string, data: Partial<Module>): Promise<Module> => {
  const response = await apiClient.put(`/content/modules/${id}`, data);
  return response.data.module;
};

export const deleteModule = async (id: string): Promise<void> => {
  await apiClient.delete(`/content/modules/${id}`);
};

export const createContentItem = async (
  data: {
    module_id: string;
    title: string;
    content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text';
    content_url?: string;
    content_text?: string;
    duration_minutes?: number;
    order_index?: number;
    is_preview?: boolean;
    is_required?: boolean;
  },
  file?: File
): Promise<ContentItem> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  if (file) {
    formData.append('file', file);
  }
  const response = await apiClient.post('/content/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.content_item;
};

export const updateContentItem = async (
  id: string,
  data: Partial<ContentItem>,
  file?: File
): Promise<ContentItem> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  if (file) {
    formData.append('file', file);
  }
  const response = await apiClient.put(`/content/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.content_item;
};

export const deleteContentItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/content/items/${id}`);
};

export const getContentItem = async (id: string): Promise<ContentItem & { quiz?: any }> => {
  const response = await apiClient.get(`/content/items/${id}`);
  return response.data.content;
};

