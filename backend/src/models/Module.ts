import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export class ModuleModel {
  static async create(data: {
    course_id: string;
    title: string;
    description?: string;
    order_index?: number;
  }): Promise<Module> {
    // Get max order_index for the course
    const [maxResult] = await pool.query(
      'SELECT COALESCE(MAX(order_index), 0) as max_order FROM modules WHERE course_id = ?',
      [data.course_id]
    );
    const order_index = data.order_index ?? (maxResult as any[])[0].max_order + 1;

    await pool.query(
      'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
      [data.course_id, data.title, data.description || null, order_index]
    );
    const [result] = await pool.query(
      'SELECT * FROM modules WHERE course_id = ? AND order_index = ?',
      [data.course_id, order_index]
    );
    return getFirstRow(result);
  }

  static async findByCourse(course_id: string): Promise<Module[]> {
    const [result] = await pool.query(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index',
      [course_id]
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Module | null> {
    const [result] = await pool.query('SELECT * FROM modules WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<Module>): Promise<Module | null> {
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
      `UPDATE modules SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM modules WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM modules WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}
