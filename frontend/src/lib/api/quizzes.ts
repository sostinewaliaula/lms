import apiClient from './client';

export interface Quiz {
  id: string;
  content_item_id: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[] | null;
  correct_answer: any;
  points: number;
  order_index: number;
  created_at: string;
}

export const createQuiz = async (data: {
  content_item_id: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  max_attempts?: number;
}): Promise<Quiz> => {
  const response = await apiClient.post('/content/quizzes', data);
  return response.data.quiz;
};

export const addQuizQuestion = async (quizId: string, data: {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: any;
  correct_answer: any;
  points?: number;
}): Promise<QuizQuestion> => {
  const response = await apiClient.post(`/content/quizzes/${quizId}/questions`, data);
  return response.data.question;
};

export const updateQuiz = async (
  quizId: string,
  data: Partial<{
    title: string;
    description: string;
    time_limit_minutes: number | null;
    passing_score: number;
    max_attempts: number;
  }>
): Promise<Quiz> => {
  const response = await apiClient.put(`/content/quizzes/${quizId}`, data);
  return response.data.quiz;
};


