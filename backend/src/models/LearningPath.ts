import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  difficulty_level?: string;
  estimated_duration_hours?: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
  courses_count?: number;
  total_hours?: number;
}

export class LearningPathModel {
  static async findAll(): Promise<LearningPath[]> {
    const [result] = await pool.query(
      `SELECT lp.*,
              COUNT(DISTINCT pc.course_id) AS courses_count,
              COALESCE(SUM(c.duration_hours), 0) AS total_hours
       FROM learning_paths lp
       LEFT JOIN path_courses pc ON lp.id = pc.path_id
       LEFT JOIN courses c ON pc.course_id = c.id
       GROUP BY lp.id
       ORDER BY lp.created_at DESC`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<LearningPath | null> {
    const [result] = await pool.query(
      `SELECT lp.*,
              COUNT(DISTINCT pc.course_id) AS courses_count,
              COALESCE(SUM(c.duration_hours), 0) AS total_hours
       FROM learning_paths lp
       LEFT JOIN path_courses pc ON lp.id = pc.path_id
       LEFT JOIN courses c ON pc.course_id = c.id
       WHERE lp.id = ?
       GROUP BY lp.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    difficulty_level?: string;
    estimated_duration_hours?: number;
    is_published?: boolean;
  }): Promise<LearningPath> {
    await pool.query(
      `INSERT INTO learning_paths (title, description, thumbnail_url, difficulty_level, estimated_duration_hours, is_published)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description || null,
        data.thumbnail_url || null,
        data.difficulty_level || null,
        data.estimated_duration_hours ?? null,
        data.is_published ? 1 : 0,
      ]
    );
    const [result] = await pool.query(
      'SELECT * FROM learning_paths WHERE title = ? ORDER BY created_at DESC LIMIT 1',
      [data.title]
    );
    return getFirstRow(result);
  }

  static async update(
    id: string,
    updates: Partial<Omit<LearningPath, 'id' | 'created_at' | 'updated_at' | 'courses_count' | 'total_hours'>>
  ): Promise<LearningPath | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.query(
      `UPDATE learning_paths SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM learning_paths WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async replaceCourses(pathId: string, courseIds: string[]): Promise<void> {
    await pool.query('DELETE FROM path_courses WHERE path_id = ?', [pathId]);
    if (courseIds.length === 0) return;
    const values = courseIds.map((courseId) => [pathId, courseId, 0, 1]);
    await pool.query(
      'INSERT INTO path_courses (path_id, course_id, order_index, is_required) VALUES ?',
      [values]
    );
  }
}


