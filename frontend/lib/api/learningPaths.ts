import apiClient from './client';

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  difficulty_level?: string;
  estimated_duration_hours?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  courses_count?: number;
  total_hours?: number;
}

export const getLearningPaths = async (): Promise<LearningPath[]> => {
  const response = await apiClient.get('/learning-paths');
  return response.data.paths || response.data;
};

export const createLearningPath = async (data: Partial<LearningPath> & { course_ids?: string[] }) => {
  const response = await apiClient.post('/learning-paths', data);
  return response.data.path;
};

export const updateLearningPath = async (id: string, data: Partial<LearningPath> & { course_ids?: string[] }) => {
  const response = await apiClient.put(`/learning-paths/${id}`, data);
  return response.data.path;
};

export const deleteLearningPath = async (id: string): Promise<void> => {
  await apiClient.delete(`/learning-paths/${id}`);
};


