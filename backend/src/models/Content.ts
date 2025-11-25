import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface ContentItem {
  id: string;
  module_id: string;
  title: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index: number;
  is_preview: boolean;
  is_required: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ContentModel {
  static async create(data: {
    module_id: string;
    title: string;
    content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text';
    content_url?: string;
    content_text?: string;
    duration_minutes?: number;
    order_index?: number;
    is_preview?: boolean;
    is_required?: boolean;
  }): Promise<ContentItem> {
    // Get max order_index for the module
    const [maxResult] = await pool.query(
      'SELECT COALESCE(MAX(order_index), 0) as max_order FROM content_items WHERE module_id = ?',
      [data.module_id]
    );
    const order_index = data.order_index ?? (maxResult as any[])[0].max_order + 1;

    await pool.query(
      `INSERT INTO content_items (
        module_id, title, content_type, content_url, content_text,
        duration_minutes, order_index, is_preview, is_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.module_id,
        data.title,
        data.content_type,
        data.content_url || null,
        data.content_text || null,
        data.duration_minutes || null,
        order_index,
        data.is_preview ?? false,
        data.is_required ?? true,
      ]
    );
    const [result] = await pool.query(
      'SELECT * FROM content_items WHERE module_id = ? AND order_index = ?',
      [data.module_id, order_index]
    );
    return getFirstRow(result);
  }

  static async findByModule(module_id: string): Promise<ContentItem[]> {
    const [result] = await pool.query(
      'SELECT * FROM content_items WHERE module_id = ? ORDER BY order_index',
      [module_id]
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<ContentItem | null> {
    const [result] = await pool.query('SELECT * FROM content_items WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
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
      `UPDATE content_items SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM content_items WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM content_items WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}
