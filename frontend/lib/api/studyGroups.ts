import apiClient from './client';

export interface StudyGroup {
  id: string;
  course_id?: string;
  name: string;
  description?: string;
  max_members: number;
  created_by: string;
  created_at: string;
  course_title?: string;
  course_slug?: string;
  creator_name?: string;
  creator_email?: string;
  members_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export const getStudyGroups = async (filters?: {
  course_id?: string;
  created_by?: string;
}): Promise<StudyGroup[]> => {
  const params = new URLSearchParams();
  if (filters?.course_id) params.append('course_id', filters.course_id);
  if (filters?.created_by) params.append('created_by', filters.created_by);
  
  const queryString = params.toString();
  const url = queryString ? `/study-groups?${queryString}` : '/study-groups';
  const response = await apiClient.get(url);
  return response.data.groups || response.data;
};

export const getStudyGroup = async (id: string): Promise<StudyGroup> => {
  const response = await apiClient.get(`/study-groups/${id}`);
  return response.data.group;
};

export const createStudyGroup = async (data: Partial<StudyGroup>): Promise<StudyGroup> => {
  const response = await apiClient.post('/study-groups', data);
  return response.data.group;
};

export const updateStudyGroup = async (id: string, data: Partial<StudyGroup>): Promise<StudyGroup> => {
  const response = await apiClient.put(`/study-groups/${id}`, data);
  return response.data.group;
};

export const deleteStudyGroup = async (id: string): Promise<void> => {
  await apiClient.delete(`/study-groups/${id}`);
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const response = await apiClient.get(`/study-groups/${groupId}/members`);
  return response.data.members;
};

export const addGroupMember = async (groupId: string, userId: string, role?: 'admin' | 'member'): Promise<void> => {
  await apiClient.post(`/study-groups/${groupId}/members`, { user_id: userId, role });
};

export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/study-groups/${groupId}/members/${userId}`);
};

export const updateMemberRole = async (groupId: string, userId: string, role: 'admin' | 'member'): Promise<void> => {
  await apiClient.put(`/study-groups/${groupId}/members/${userId}/role`, { role });
};

