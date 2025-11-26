import apiClient from './client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor_id: string;
  category_id?: string;
  department_id?: string;
  thumbnail_url?: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  visibility: 'public' | 'private';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration_hours?: number;
  rating: number;
  total_ratings: number;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
  category?: any;
  department?: any;
  instructor?: any;
}

export const getCourses = async (params?: {
  category_id?: string;
  department_id?: string;
  instructor_id?: string;
  is_published?: boolean;
  visibility?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ courses: Course[]; total: number }> => {
  const response = await apiClient.get('/courses', { params });
  return response.data;
};

export const getCourse = async (id: string): Promise<Course> => {
  const response = await apiClient.get(`/courses/${id}`);
  return response.data.course;
};

export const createCourse = async (data: Partial<Course>): Promise<Course> => {
  const response = await apiClient.post('/courses', data);
  return response.data.course;
};

export const updateCourse = async (id: string, data: Partial<Course>): Promise<Course> => {
  const response = await apiClient.put(`/courses/${id}`, data);
  return response.data.course;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await apiClient.delete(`/courses/${id}`);
};

export const enrollInCourse = async (course_id: string): Promise<void> => {
  await apiClient.post('/courses/enroll', { course_id });
};


