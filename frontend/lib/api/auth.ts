import apiClient from './client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.put('/auth/change-password', data);
    return response.data;
  },
};


