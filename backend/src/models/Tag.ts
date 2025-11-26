import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: Date;
}

export class TagModel {
  static async findAll(): Promise<Tag[]> {
    const [result] = await pool.query(
      `SELECT t.*, 
              COUNT(DISTINCT j.course_id) as courses_count
       FROM course_tags t
       LEFT JOIN course_tags_junction j ON t.id = j.tag_id
       GROUP BY t.id
       ORDER BY t.name ASC`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Tag | null> {
    const [result] = await pool.query(
      `SELECT t.*, 
              COUNT(DISTINCT j.course_id) as courses_count
       FROM course_tags t
       LEFT JOIN course_tags_junction j ON t.id = j.tag_id
       WHERE t.id = ?
       GROUP BY t.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: { name: string; description?: string; icon?: string }): Promise<Tag> {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await pool.query(
      `INSERT INTO course_tags (name, slug, description, icon)
       VALUES (?, ?, ?, ?)`,
      [data.name, slug, data.description || null, data.icon || null]
    );
    const [result] = await pool.query('SELECT * FROM course_tags WHERE slug = ? LIMIT 1', [slug]);
    return getFirstRow(result);
  }

  static async update(
    id: string,
    updates: { name?: string; description?: string; icon?: string }
  ): Promise<Tag | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
      const slug = updates.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      fields.push('slug = ?');
      values.push(slug);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }

    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon || null);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE course_tags SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM course_tags WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}


