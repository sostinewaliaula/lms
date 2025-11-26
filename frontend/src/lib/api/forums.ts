import apiClient from './client';

export interface ForumThread {
  id: string;
  course_id?: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at?: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export const getThreadsByCourse = async (courseId: string): Promise<ForumThread[]> => {
  const response = await apiClient.get(`/forums/course/${courseId}`);
  return response.data.threads || response.data;
};

export const getThread = async (id: string): Promise<{ thread: ForumThread; posts: ForumPost[] }> => {
  const response = await apiClient.get(`/forums/${id}`);
  return response.data;
};

export const createThread = async (data: {
  course_id?: string;
  title: string;
  content: string;
}): Promise<ForumThread> => {
  const response = await apiClient.post('/forums', data);
  return response.data.forum || response.data.thread;
};

export const createPost = async (forumId: string, content: string): Promise<ForumPost> => {
  const response = await apiClient.post(`/forums/${forumId}/posts`, { content });
  return response.data.post || response.data;
};

export const deleteThread = async (id: string): Promise<void> => {
  await apiClient.delete(`/forums/${id}`);
};


