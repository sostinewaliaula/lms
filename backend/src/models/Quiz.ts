import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Quiz {
  id: string;
  content_item_id: string;
  title: string;
  description?: string;
  time_limit_minutes?: number;
  passing_score: number;
  max_attempts: number;
  created_at: Date;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: any;
  correct_answer: any;
  points: number;
  order_index: number;
  created_at: Date;
}

export class QuizModel {
  static async create(data: {
    content_item_id: string;
    title: string;
    description?: string;
    time_limit_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
  }): Promise<Quiz> {
    await pool.query(
      `INSERT INTO quizzes (content_item_id, title, description, time_limit_minutes, passing_score, max_attempts)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.content_item_id,
        data.title,
        data.description || null,
        data.time_limit_minutes || null,
        data.passing_score || 70,
        data.max_attempts || 3,
      ]
    );
    const [result] = await pool.query(
      'SELECT * FROM quizzes WHERE content_item_id = ?',
      [data.content_item_id]
    );
    return getFirstRow(result);
  }

  static async findById(id: string): Promise<Quiz | null> {
    const [result] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async findByContentItem(content_item_id: string): Promise<Quiz | null> {
    const [result] = await pool.query(
      'SELECT * FROM quizzes WHERE content_item_id = ?',
      [content_item_id]
    );
    return getFirstRow(result);
  }

  static async addQuestion(data: {
    quiz_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    options?: any;
    correct_answer: any;
    points?: number;
    order_index?: number;
  }): Promise<QuizQuestion> {
    const [maxResult] = await pool.query(
      'SELECT COALESCE(MAX(order_index), 0) as max_order FROM quiz_questions WHERE quiz_id = ?',
      [data.quiz_id]
    );
    const order_index = data.order_index ?? (maxResult as any[])[0].max_order + 1;

    await pool.query(
      `INSERT INTO quiz_questions (
        quiz_id, question_text, question_type, options, correct_answer, points, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.quiz_id,
        data.question_text,
        data.question_type,
        data.options ? JSON.stringify(data.options) : null,
        JSON.stringify(data.correct_answer),
        data.points || 1,
        order_index,
      ]
    );
    const [result] = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? AND order_index = ?',
      [data.quiz_id, order_index]
    );
    const row = getFirstRow(result);
    if (row) {
      return {
        ...row,
        options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : null,
        correct_answer: typeof row.correct_answer === 'string' ? JSON.parse(row.correct_answer) : row.correct_answer,
      };
    }
    return row;
  }

  static async getQuestions(quiz_id: string): Promise<QuizQuestion[]> {
    const [result] = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index',
      [quiz_id]
    );
    // Parse JSON fields
    return getAllRows(result).map((row: any) => ({
      ...row,
      options: row.options ? (typeof row.options === 'string' ? JSON.parse(row.options) : row.options) : null,
      correct_answer: typeof row.correct_answer === 'string' ? JSON.parse(row.correct_answer) : row.correct_answer,
    }));
  }

  static async submitAttempt(data: {
    user_id: string;
    quiz_id: string;
    answers: any;
    score: number;
    total_points: number;
  }): Promise<void> {
    const quiz = await this.findById(data.quiz_id);
    if (!quiz) throw new Error('Quiz not found');

    const is_passed = data.score >= quiz.passing_score;

    await pool.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, total_points, answers, submitted_at, is_passed)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      [
        data.user_id,
        data.quiz_id,
        data.score,
        data.total_points,
        JSON.stringify(data.answers),
        is_passed,
      ]
    );
  }
}
