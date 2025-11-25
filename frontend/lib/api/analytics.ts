import apiClient from './client';

export const getDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
};

export const getCourseAnalytics = async (course_id: string): Promise<any> => {
  const response = await apiClient.get(`/analytics/course/${course_id}`);
  return response.data;
};

export const getUserEngagement = async (days: number = 30): Promise<any> => {
  const response = await apiClient.get('/analytics/engagement', { params: { days } });
  return response.data;
};

