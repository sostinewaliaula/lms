import apiClient from './client';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'instructor' | 'student';
  department_id?: string;
  department_name?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  stats?: {
    enrolled_courses: number;
    completed_courses: number;
    certificates: number;
  };
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  role: User['role'];
  department_id?: string;
  password: string;
}

export const getUsers = async (params?: {
  role?: string;
  department_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: User[]; total: number }> => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.user;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.user;
};

export const createUser = async (data: CreateUserPayload): Promise<User> => {
  const response = await apiClient.post('/users', data);
  return response.data.user;
};

export const deleteUser = async (id: string, options?: { hard?: boolean }): Promise<void> => {
  await apiClient.delete(`/users/${id}`, { params: options });
};

