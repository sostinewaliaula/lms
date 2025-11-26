import apiClient from './client';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: string;
  criteria?: any;
  users_count?: number;
  created_at: string;
}

export const getBadges = async (): Promise<Badge[]> => {
  const response = await apiClient.get('/badges');
  return response.data.badges || response.data;
};

export const getBadge = async (id: string): Promise<Badge> => {
  const response = await apiClient.get(`/badges/${id}`);
  return response.data.badge;
};

export const createBadge = async (data: Partial<Badge>): Promise<Badge> => {
  const response = await apiClient.post('/badges', data);
  return response.data.badge;
};

export const updateBadge = async (id: string, data: Partial<Badge>): Promise<Badge> => {
  const response = await apiClient.put(`/badges/${id}`, data);
  return response.data.badge;
};

export const deleteBadge = async (id: string): Promise<void> => {
  await apiClient.delete(`/badges/${id}`);
};

