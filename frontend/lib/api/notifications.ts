import apiClient from './client';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: { type: string; count: number }[];
}

export const getNotifications = async (filters?: {
  user_id?: string;
  type?: string;
  is_read?: boolean;
}): Promise<Notification[]> => {
  const params = new URLSearchParams();
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.is_read !== undefined) {
    params.append('is_read', filters.is_read ? 'true' : 'false');
  }
  
  const queryString = params.toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';
  const response = await apiClient.get(url);
  return response.data.notifications || response.data;
};

export const getNotification = async (id: string): Promise<Notification> => {
  const response = await apiClient.get(`/notifications/${id}`);
  return response.data.notification;
};

export const createNotification = async (data: Partial<Notification>): Promise<Notification> => {
  const response = await apiClient.post('/notifications', data);
  return response.data.notification;
};

export const updateNotification = async (id: string, data: Partial<Notification>): Promise<Notification> => {
  const response = await apiClient.put(`/notifications/${id}`, data);
  return response.data.notification;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apiClient.put(`/notifications/${id}/read`);
};

export const getNotificationStats = async (): Promise<NotificationStats> => {
  const response = await apiClient.get('/notifications/stats');
  return response.data.stats;
};

