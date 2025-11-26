import apiClient from './client';

export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  manager_id?: string;
  manager_first_name?: string;
  manager_last_name?: string;
  created_at: string;
  updated_at: string;
  stats?: {
    total_courses: number;
    total_users: number;
    total_enrollments: number;
  };
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get('/departments');
  return response.data.departments;
};

export const getDepartment = async (id: string): Promise<Department> => {
  const response = await apiClient.get(`/departments/${id}`);
  return response.data.department;
};

export const createDepartment = async (data: Partial<Department>): Promise<Department> => {
  const response = await apiClient.post('/departments', data);
  return response.data.department;
};

export const updateDepartment = async (id: string, data: Partial<Department>): Promise<Department> => {
  const response = await apiClient.put(`/departments/${id}`, data);
  return response.data.department;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};


