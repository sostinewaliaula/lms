import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'instructor' | 'student';
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'instructor' | 'student';
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return getFirstRow(result);
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return getFirstRow(result);
  }

  static async create(data: CreateUserData): Promise<User> {
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      [data.email, data.password_hash, data.first_name, data.last_name, data.role || 'student']
    );
    const result = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [data.email]
    );
    return getFirstRow(result);
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
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
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, avatar_url, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return getFirstRow(result);
  }

  static async updatePassword(id: string, password_hash: string): Promise<void> {
    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [password_hash, id]
    );
  }
}

