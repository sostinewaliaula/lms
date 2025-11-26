import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_skill_id?: string;
  created_at: Date;
  courses_count?: number;
  users_count?: number;
}

export class SkillModel {
  static async findAll(): Promise<Skill[]> {
    const [result] = await pool.query(
      `SELECT s.*,
              COUNT(DISTINCT cs.course_id) AS courses_count,
              COUNT(DISTINCT us.user_id)   AS users_count
       FROM skills s
       LEFT JOIN course_skills cs ON s.id = cs.skill_id
       LEFT JOIN user_skills   us ON s.id = us.skill_id
       GROUP BY s.id
       ORDER BY s.name ASC`
    );
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Skill | null> {
    const [result] = await pool.query(
      `SELECT s.*,
              COUNT(DISTINCT cs.course_id) AS courses_count,
              COUNT(DISTINCT us.user_id)   AS users_count
       FROM skills s
       LEFT JOIN course_skills cs ON s.id = cs.skill_id
       LEFT JOIN user_skills   us ON s.id = us.skill_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    name: string;
    description?: string;
    parent_skill_id?: string;
  }): Promise<Skill> {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    await pool.query(
      `INSERT INTO skills (name, slug, description, parent_skill_id)
       VALUES (?, ?, ?, ?)`,
      [data.name, slug, data.description || null, data.parent_skill_id || null]
    );

    const [result] = await pool.query('SELECT * FROM skills WHERE slug = ? ORDER BY created_at DESC LIMIT 1', [
      slug,
    ]);
    return getFirstRow(result);
  }

  static async update(
    id: string,
    updates: { name?: string; description?: string; parent_skill_id?: string | null }
  ): Promise<Skill | null> {
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

    if (updates.parent_skill_id !== undefined) {
      fields.push('parent_skill_id = ?');
      values.push(updates.parent_skill_id || null);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE skills SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM skills WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
}


