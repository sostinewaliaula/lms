import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export class NotificationModel {
  static async findAll(filters?: {
    user_id?: string;
    type?: string;
    is_read?: boolean;
  }): Promise<Notification[]> {
    let query = `
      SELECT n.*,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.email as user_email
      FROM notifications n
      INNER JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.user_id) {
      query += ' AND n.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters?.type) {
      query += ' AND n.type = ?';
      params.push(filters.type);
    }

    if (filters?.is_read !== undefined) {
      query += ' AND n.is_read = ?';
      params.push(filters.is_read ? 1 : 0);
    }

    query += ' ORDER BY n.created_at DESC';

    const [result] = await pool.query(query, params);
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Notification | null> {
    const [result] = await pool.query(
      `SELECT n.*,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email as user_email
       FROM notifications n
       INNER JOIN users u ON n.user_id = u.id
       WHERE n.id = ?`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    user_id: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
  }): Promise<Notification> {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.type,
        data.title,
        data.message || null,
        data.link || null,
      ]
    );

    const [result] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND title = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.title]
    );
    const notification = getFirstRow(result);
    return this.findById(notification!.id)!;
  }

  static async update(
    id: string,
    updates: {
      type?: string;
      title?: string;
      message?: string;
      link?: string;
      is_read?: boolean;
    }
  ): Promise<Notification | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }

    if (updates.message !== undefined) {
      fields.push('message = ?');
      values.push(updates.message || null);
    }

    if (updates.link !== undefined) {
      fields.push('link = ?');
      values.push(updates.link || null);
    }

    if (updates.is_read !== undefined) {
      fields.push('is_read = ?');
      values.push(updates.is_read ? 1 : 0);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async markAsRead(id: string): Promise<boolean> {
    const [result] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return (result as any).affectedRows || 0;
  }

  static async getStats(): Promise<{
    total: number;
    unread: number;
    by_type: { type: string; count: number }[];
  }> {
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM notifications');
    const total = (totalResult as any[])[0]?.total || 0;

    const [unreadResult] = await pool.query('SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0');
    const unread = (unreadResult as any[])[0]?.unread || 0;

    const [typeResult] = await pool.query(
      `SELECT type, COUNT(*) as count 
       FROM notifications 
       GROUP BY type 
       ORDER BY count DESC`
    );
    const by_type = getAllRows(typeResult);

    return {
      total,
      unread,
      by_type,
    };
  }
}

