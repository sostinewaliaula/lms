import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Progress {
  id: string;
  user_id: string;
  content_item_id: string;
  is_completed: boolean;
  completed_at?: Date;
  time_spent_minutes: number;
  last_accessed_at: Date;
}

export class ProgressModel {
  static async createOrUpdate(data: {
    user_id: string;
    content_item_id: string;
    is_completed?: boolean;
    time_spent_minutes?: number;
  }): Promise<Progress> {
    const [result] = await pool.query(
      `INSERT INTO progress (user_id, content_item_id, is_completed, time_spent_minutes, last_accessed_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         is_completed = COALESCE(VALUES(is_completed), is_completed),
         completed_at = CASE WHEN VALUES(is_completed) = 1 AND completed_at IS NULL 
                            THEN CURRENT_TIMESTAMP 
                            ELSE completed_at END,
         time_spent_minutes = time_spent_minutes + COALESCE(VALUES(time_spent_minutes), 0),
         last_accessed_at = CURRENT_TIMESTAMP`,
      [
        data.user_id,
        data.content_item_id,
        data.is_completed ?? false,
        data.time_spent_minutes || 0,
      ]
    );
    const [progressResult] = await pool.query(
      'SELECT * FROM progress WHERE user_id = ? AND content_item_id = ?',
      [data.user_id, data.content_item_id]
    );
    return getFirstRow(progressResult);
  }

  static async findByUserAndContent(
    user_id: string,
    content_item_id: string
  ): Promise<Progress | null> {
    const [result] = await pool.query(
      'SELECT * FROM progress WHERE user_id = ? AND content_item_id = ?',
      [user_id, content_item_id]
    );
    return getFirstRow(result);
  }

  static async findByUserAndCourse(
    user_id: string,
    course_id: string
  ): Promise<Progress[]> {
    const [result] = await pool.query(
      `SELECT p.*, ci.id as content_item_id, ci.title, ci.content_type, m.id as module_id
       FROM progress p
       JOIN content_items ci ON p.content_item_id = ci.id
       JOIN modules m ON ci.module_id = m.id
       WHERE p.user_id = ? AND m.course_id = ?`,
      [user_id, course_id]
    );
    return getAllRows(result);
  }

  static async calculateCourseProgress(
    user_id: string,
    course_id: string
  ): Promise<number> {
    // Get all content items for the course
    const [contentResult] = await pool.query(
      `SELECT ci.id, ci.is_required
       FROM content_items ci
       JOIN modules m ON ci.module_id = m.id
       WHERE m.course_id = ? AND ci.is_required = 1`,
      [course_id]
    );

    const contentItems = contentResult as any[];
    if (contentItems.length === 0) return 0;

    // Get completed content items
    const [completedResult] = await pool.query(
      `SELECT COUNT(DISTINCT p.content_item_id) as completed
       FROM progress p
       JOIN content_items ci ON p.content_item_id = ci.id
       JOIN modules m ON ci.module_id = m.id
       WHERE p.user_id = ? AND m.course_id = ? AND p.is_completed = 1 AND ci.is_required = 1`,
      [user_id, course_id]
    );

    const completed = parseInt((completedResult as any[])[0].completed);
    const total = contentItems.length;

    return Math.round((completed / total) * 100);
  }
}
