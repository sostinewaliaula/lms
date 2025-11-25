import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: Date;
}

export class CategoryModel {
  static async create(data: { name: string; description?: string; icon?: string }): Promise<Category> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    await pool.query(
      'INSERT INTO course_categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      [data.name, slug, data.description || null, data.icon || null]
    );
    const [result] = await pool.query('SELECT * FROM course_categories WHERE slug = ?', [slug]);
    return getFirstRow(result);
  }

  static async findAll(): Promise<Category[]> {
    const [result] = await pool.query('SELECT * FROM course_categories ORDER BY name');
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Category | null> {
    const [result] = await pool.query('SELECT * FROM course_categories WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<Category>): Promise<Category | null> {
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
      `UPDATE course_categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM course_categories WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM course_categories WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}
