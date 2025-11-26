import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface StudyGroup {
  id: string;
  course_id?: string;
  name: string;
  description?: string;
  max_members: number;
  created_by: string;
  created_at: Date;
  // Joined fields
  course_title?: string;
  course_slug?: string;
  creator_name?: string;
  creator_email?: string;
  members_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export class StudyGroupModel {
  static async findAll(filters?: { course_id?: string; created_by?: string }): Promise<StudyGroup[]> {
    let query = `
      SELECT sg.*,
             c.title as course_title,
             c.slug as course_slug,
             CONCAT(u.first_name, ' ', u.last_name) as creator_name,
             u.email as creator_email,
             COUNT(DISTINCT gm.user_id) as members_count
      FROM study_groups sg
      LEFT JOIN courses c ON sg.course_id = c.id
      INNER JOIN users u ON sg.created_by = u.id
      LEFT JOIN group_members gm ON sg.id = gm.group_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.course_id) {
      query += ' AND sg.course_id = ?';
      params.push(filters.course_id);
    }

    if (filters?.created_by) {
      query += ' AND sg.created_by = ?';
      params.push(filters.created_by);
    }

    query += ' GROUP BY sg.id ORDER BY sg.created_at DESC';

    const [result] = await pool.query(query, params);
    return getAllRows(result);
  }

  static async findById(id: string): Promise<StudyGroup | null> {
    const [result] = await pool.query(
      `SELECT sg.*,
              c.title as course_title,
              c.slug as course_slug,
              CONCAT(u.first_name, ' ', u.last_name) as creator_name,
              u.email as creator_email,
              COUNT(DISTINCT gm.user_id) as members_count
       FROM study_groups sg
       LEFT JOIN courses c ON sg.course_id = c.id
       INNER JOIN users u ON sg.created_by = u.id
       LEFT JOIN group_members gm ON sg.id = gm.group_id
       WHERE sg.id = ?
       GROUP BY sg.id`,
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: {
    course_id?: string;
    name: string;
    description?: string;
    max_members?: number;
    created_by: string;
  }): Promise<StudyGroup> {
    await pool.query(
      `INSERT INTO study_groups (course_id, name, description, max_members, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.course_id || null,
        data.name,
        data.description || null,
        data.max_members || 20,
        data.created_by,
      ]
    );

    const [result] = await pool.query(
      'SELECT * FROM study_groups WHERE name = ? AND created_by = ? ORDER BY created_at DESC LIMIT 1',
      [data.name, data.created_by]
    );
    const group = getFirstRow(result);

    // Add creator as admin member
    if (group) {
      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
        [group.id, data.created_by, 'admin']
      );
    }

    return this.findById(group!.id)!;
  }

  static async update(
    id: string,
    updates: {
      course_id?: string;
      name?: string;
      description?: string;
      max_members?: number;
    }
  ): Promise<StudyGroup | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.course_id !== undefined) {
      fields.push('course_id = ?');
      values.push(updates.course_id || null);
    }

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }

    if (updates.max_members !== undefined) {
      fields.push('max_members = ?');
      values.push(updates.max_members);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE study_groups SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM study_groups WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async getMembers(groupId: string): Promise<GroupMember[]> {
    const [result] = await pool.query(
      `SELECT gm.*,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email as user_email
       FROM group_members gm
       INNER JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.role DESC, gm.joined_at ASC`,
      [groupId]
    );
    return getAllRows(result);
  }

  static async addMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<boolean> {
    try {
      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
        [groupId, userId, role]
      );
      return true;
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        return false; // Already a member
      }
      throw error;
    }
  }

  static async removeMember(groupId: string, userId: string): Promise<boolean> {
    const [result] = await pool.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return (result as any).affectedRows > 0;
  }

  static async updateMemberRole(groupId: string, userId: string, role: 'admin' | 'member'): Promise<boolean> {
    const [result] = await pool.query(
      'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
      [role, groupId, userId]
    );
    return (result as any).affectedRows > 0;
  }
}

