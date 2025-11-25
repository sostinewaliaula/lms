import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: Date;
  completed_at?: Date;
  progress_percentage: number;
}

export class EnrollmentModel {
  static async create(user_id: string, course_id: string): Promise<Enrollment> {
    await pool.query(
      `INSERT INTO enrollments (user_id, course_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [user_id, course_id]
    );
    const [result] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return getFirstRow(result);
  }

  static async findByUserAndCourse(user_id: string, course_id: string): Promise<Enrollment | null> {
    const [result] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return getFirstRow(result);
  }

  static async findByUser(user_id: string): Promise<Enrollment[]> {
    const [result] = await pool.query(
      `SELECT e.*, c.title, c.slug, c.thumbnail_url, c.instructor_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`,
      [user_id]
    );
    return getAllRows(result);
  }

  static async updateProgress(
    user_id: string,
    course_id: string,
    progress_percentage: number
  ): Promise<void> {
    await pool.query(
      `UPDATE enrollments
       SET progress_percentage = ?,
           completed_at = CASE WHEN ? >= 100 THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE completed_at END
       WHERE user_id = ? AND course_id = ?`,
      [progress_percentage, progress_percentage, user_id, course_id]
    );
  }

  static async markComplete(user_id: string, course_id: string): Promise<void> {
    await pool.query(
      `UPDATE enrollments
       SET completed_at = CURRENT_TIMESTAMP,
           progress_percentage = 100
       WHERE user_id = ? AND course_id = ?`,
      [user_id, course_id]
    );
  }
}
