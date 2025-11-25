import apiClient from './client';

export const coursesApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/courses', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/courses', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/courses/${id}`);
    return response.data;
  },

  enroll: async (course_id: string) => {
    const response = await apiClient.post('/courses/enroll', { course_id });
    return response.data;
  },

  getMyCourses: async () => {
    const response = await apiClient.get('/courses/my-courses');
    return response.data;
  },
};


