import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: string;
  criteria?: any;
  created_at: Date;
  users_count?: number;
}

export class BadgeModel {
  static async findAll(): Promise<Badge[]> {
    const [result] = await pool.query(
      `SELECT b.*, 
              COUNT(DISTINCT ub.user_id) as users_count
       FROM badges b
       LEFT JOIN user_badges ub ON b.id = ub.badge_id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Badge | null> {
    const [result] = await pool.query(
      `SELECT b.*, 
              COUNT(DISTINCT ub.user_id) as users_count
       FROM badges b
       LEFT JOIN user_badges ub ON b.id = ub.badge_id
       WHERE b.id = ?
       GROUP BY b.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    name: string;
    description?: string;
    icon_url?: string;
    badge_type: string;
    criteria?: any;
  }): Promise<Badge> {
    const criteriaJson = data.criteria ? JSON.stringify(data.criteria) : null;
    
    await pool.query(
      `INSERT INTO badges (name, description, icon_url, badge_type, criteria)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.icon_url || null,
        data.badge_type,
        criteriaJson,
      ]
    );
    
    const [result] = await pool.query(
      'SELECT * FROM badges WHERE name = ? ORDER BY created_at DESC LIMIT 1',
      [data.name]
    );
    return getFirstRow(result);
  }

  static async update(
    id: string,
    updates: {
      name?: string;
      description?: string;
      icon_url?: string;
      badge_type?: string;
      criteria?: any;
    }
  ): Promise<Badge | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }

    if (updates.icon_url !== undefined) {
      fields.push('icon_url = ?');
      values.push(updates.icon_url || null);
    }

    if (updates.badge_type !== undefined) {
      fields.push('badge_type = ?');
      values.push(updates.badge_type);
    }

    if (updates.criteria !== undefined) {
      fields.push('criteria = ?');
      values.push(updates.criteria ? JSON.stringify(updates.criteria) : null);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE badges SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM badges WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}

