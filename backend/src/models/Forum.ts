import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Forum {
  id: string;
  course_id?: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  reply_count: number;
  last_reply_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ForumPost {
  id: string;
  forum_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export class ForumModel {
  static async create(data: {
    course_id?: string;
    user_id: string;
    title: string;
    content: string;
  }): Promise<Forum> {
    await pool.query(
      `INSERT INTO forums (course_id, user_id, title, content)
       VALUES (?, ?, ?, ?)`,
      [data.course_id || null, data.user_id, data.title, data.content]
    );
    const [result] = await pool.query(
      'SELECT * FROM forums WHERE user_id = ? AND title = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.title]
    );
    return getFirstRow(result);
  }

  static async findByCourse(course_id: string): Promise<Forum[]> {
    const [result] = await pool.query(
      `SELECT f.*, u.first_name, u.last_name, u.avatar_url
       FROM forums f
       JOIN users u ON f.user_id = u.id
       WHERE f.course_id = ?
       ORDER BY f.is_pinned DESC, f.last_reply_at DESC, f.created_at DESC`,
      [course_id]
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Forum | null> {
    const [result] = await pool.query(
      `SELECT f.*, u.first_name, u.last_name, u.avatar_url
       FROM forums f
       JOIN users u ON f.user_id = u.id
       WHERE f.id = ?`,
      [id]
    );
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<Forum>): Promise<Forum | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE forums SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM forums WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM forums WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async incrementReplyCount(id: string): Promise<void> {
    await pool.query(
      `UPDATE forums
       SET reply_count = reply_count + 1,
           last_reply_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id]
    );
  }
}

export class ForumPostModel {
  static async create(data: {
    forum_id: string;
    user_id: string;
    content: string;
  }): Promise<ForumPost> {
    await pool.query(
      `INSERT INTO forum_posts (forum_id, user_id, content)
       VALUES (?, ?, ?)`,
      [data.forum_id, data.user_id, data.content]
    );

    // Update forum reply count
    await ForumModel.incrementReplyCount(data.forum_id);

    const [result] = await pool.query(
      'SELECT * FROM forum_posts WHERE forum_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
      [data.forum_id, data.user_id]
    );
    return getFirstRow(result);
  }

  static async findByForum(forum_id: string): Promise<ForumPost[]> {
    const [result] = await pool.query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url
       FROM forum_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.forum_id = ?
       ORDER BY p.created_at ASC`,
      [forum_id]
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<ForumPost | null> {
    const [result] = await pool.query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url
       FROM forum_posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<ForumPost>): Promise<ForumPost | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE forum_posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM forum_posts WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM forum_posts WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}
