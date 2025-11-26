import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  points: number;
  criteria?: any;
  created_at: Date;
  users_count?: number;
}

export class AchievementModel {
  static async findAll(): Promise<Achievement[]> {
    const [result] = await pool.query(
      `SELECT a.*, 
              COUNT(DISTINCT ua.user_id) as users_count
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Achievement | null> {
    const [result] = await pool.query(
      `SELECT a.*, 
              COUNT(DISTINCT ua.user_id) as users_count
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE a.id = ?
       GROUP BY a.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    name: string;
    description?: string;
    icon_url?: string;
    points?: number;
    criteria?: any;
  }): Promise<Achievement> {
    const criteriaJson = data.criteria ? JSON.stringify(data.criteria) : null;
    
    await pool.query(
      `INSERT INTO achievements (name, description, icon_url, points, criteria)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        data.icon_url || null,
        data.points || 0,
        criteriaJson,
      ]
    );
    
    const [result] = await pool.query(
      'SELECT * FROM achievements WHERE name = ? ORDER BY created_at DESC LIMIT 1',
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
      points?: number;
      criteria?: any;
    }
  ): Promise<Achievement | null> {
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

    if (updates.points !== undefined) {
      fields.push('points = ?');
      values.push(updates.points);
    }

    if (updates.criteria !== undefined) {
      fields.push('criteria = ?');
      values.push(updates.criteria ? JSON.stringify(updates.criteria) : null);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE achievements SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM achievements WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}

