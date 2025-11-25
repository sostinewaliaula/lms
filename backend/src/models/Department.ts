import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  manager_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class DepartmentModel {
  static async create(data: {
    name: string;
    description?: string;
    manager_id?: string;
  }): Promise<Department> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    await pool.query(
      'INSERT INTO departments (name, slug, description, manager_id) VALUES (?, ?, ?, ?)',
      [data.name, slug, data.description || null, data.manager_id || null]
    );
    const [result] = await pool.query('SELECT * FROM departments WHERE slug = ?', [slug]);
    return getFirstRow(result);
  }

  static async findAll(): Promise<Department[]> {
    const [result] = await pool.query(
      `SELECT d.*, u.first_name as manager_first_name, u.last_name as manager_last_name
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       ORDER BY d.name`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Department | null> {
    const [result] = await pool.query(
      `SELECT d.*, u.first_name as manager_first_name, u.last_name as manager_last_name
       FROM departments d
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    return getFirstRow(result);
  }

  static async findBySlug(slug: string): Promise<Department | null> {
    const [result] = await pool.query('SELECT * FROM departments WHERE slug = ?', [slug]);
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<Department>): Promise<Department | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'slug') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE departments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async getStats(id: string): Promise<any> {
    const [stats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT c.id) as total_courses,
         COUNT(DISTINCT u.id) as total_users,
         COUNT(DISTINCT e.id) as total_enrollments
       FROM departments d
       LEFT JOIN courses c ON d.id = c.department_id
       LEFT JOIN users u ON d.id = u.department_id
       LEFT JOIN enrollments e ON c.id = e.course_id
       WHERE d.id = ?`,
      [id]
    );
    return (stats as any[])[0];
  }
}

