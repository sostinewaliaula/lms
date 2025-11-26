import apiClient from './client';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_skill_id?: string;
  created_at: string;
  courses_count?: number;
  users_count?: number;
}

export const getSkills = async (): Promise<Skill[]> => {
  const response = await apiClient.get('/skills');
  return response.data.skills || response.data;
};

export const createSkill = async (data: Partial<Skill>): Promise<Skill> => {
  const response = await apiClient.post('/skills', data);
  return response.data.skill;
};

export const updateSkill = async (id: string, data: Partial<Skill>): Promise<Skill> => {
  const response = await apiClient.put(`/skills/${id}`, data);
  return response.data.skill;
};

export const deleteSkill = async (id: string): Promise<void> => {
  await apiClient.delete(`/skills/${id}`);
};


