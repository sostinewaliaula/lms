import apiClient from './client';

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  points: number;
  criteria?: any;
  users_count?: number;
  created_at: string;
}

export const getAchievements = async (): Promise<Achievement[]> => {
  const response = await apiClient.get('/achievements');
  return response.data.achievements || response.data;
};

export const getAchievement = async (id: string): Promise<Achievement> => {
  const response = await apiClient.get(`/achievements/${id}`);
  return response.data.achievement;
};

export const createAchievement = async (data: Partial<Achievement>): Promise<Achievement> => {
  const response = await apiClient.post('/achievements', data);
  return response.data.achievement;
};

export const updateAchievement = async (id: string, data: Partial<Achievement>): Promise<Achievement> => {
  const response = await apiClient.put(`/achievements/${id}`, data);
  return response.data.achievement;
};

export const deleteAchievement = async (id: string): Promise<void> => {
  await apiClient.delete(`/achievements/${id}`);
};


