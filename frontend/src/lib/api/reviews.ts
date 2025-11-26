import apiClient from './client';

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  course_title?: string;
  course_slug?: string;
}

export interface ReviewStats {
  total: number;
  average_rating: number;
  by_rating: { rating: number; count: number }[];
  verified_count: number;
}

export const getReviews = async (filters?: {
  course_id?: string;
  user_id?: string;
  rating?: number;
  is_verified_purchase?: boolean;
}): Promise<Review[]> => {
  const params = new URLSearchParams();
  if (filters?.course_id) params.append('course_id', filters.course_id);
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.rating !== undefined) params.append('rating', filters.rating.toString());
  if (filters?.is_verified_purchase !== undefined) {
    params.append('is_verified_purchase', filters.is_verified_purchase ? 'true' : 'false');
  }
  
  const queryString = params.toString();
  const url = queryString ? `/reviews?${queryString}` : '/reviews';
  const response = await apiClient.get(url);
  return response.data.reviews || response.data;
};

export const getReview = async (id: string): Promise<Review> => {
  const response = await apiClient.get(`/reviews/${id}`);
  return response.data.review;
};

export const deleteReview = async (id: string): Promise<void> => {
  await apiClient.delete(`/reviews/${id}`);
};

export const getReviewStats = async (): Promise<ReviewStats> => {
  const response = await apiClient.get('/reviews/stats');
  return response.data.stats;
};


