import apiClient from './client';

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  courses_completed: number;
  badges_earned: number;
  rank: number;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  avatar_url?: string;
}

export interface LeaderboardStats {
  total_users: number;
  average_points: number;
  top_points: number;
  total_courses_completed: number;
  total_badges_earned: number;
}

export const getLeaderboard = async (limit?: number): Promise<LeaderboardEntry[]> => {
  const params = limit ? { limit: limit.toString() } : {};
  const response = await apiClient.get('/leaderboard', { params });
  return response.data.leaderboard || response.data;
};

export const getUserRank = async (userId: string): Promise<LeaderboardEntry> => {
  const response = await apiClient.get(`/leaderboard/user/${userId}`);
  return response.data.entry;
};

export const recalculateRanks = async (): Promise<void> => {
  await apiClient.get('/leaderboard/recalculate');
};

export const getLeaderboardStats = async (): Promise<LeaderboardStats> => {
  const response = await apiClient.get('/leaderboard/stats');
  return response.data.stats;
};

