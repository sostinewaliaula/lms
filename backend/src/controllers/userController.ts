import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';
import { hashPassword } from '../utils/password';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, department_id, search, limit = 50, offset = 0 } = req.query;
    console.log('[API] GET /users', { role, department_id, search, limit, offset });

    let query = `
      SELECT u.*, d.name as department_name, up.bio
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = parseInt((countResult as any[])[0].count);

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [result] = await pool.query(query, params);
    const users = getAllRows(result);
    console.log('[API] /users result', { total, returned: users.length });

    res.json({ users, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, role = 'student', department_id, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({ error: 'First name, last name, email, and password are required' });
      return;
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const password_hash = await hashPassword(password);
    const user = await UserModel.create({
      first_name,
      last_name,
      email,
      role,
      password_hash,
      department_id,
    });

    await pool.query('INSERT INTO user_profiles (user_id) VALUES (?)', [user.id]);

    const { password_hash: _, ...sanitizedUser } = user as any;

    res.status(201).json({
      message: 'User created successfully',
      user: sanitizedUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `SELECT u.*, d.name as department_name, up.*
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [id]
    );
    const user = getFirstRow(result);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user stats
    const [stats] = await pool.query(
      `SELECT 
         COUNT(DISTINCT e.id) as enrolled_courses,
         COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) as completed_courses,
         COUNT(DISTINCT c.id) as certificates
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       LEFT JOIN certificates c ON u.id = c.user_id
       WHERE u.id = ?`,
      [id]
    );
    (user as any).stats = (stats as any[])[0];

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await UserModel.update(id, updates);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as any;
    const currentUserId = authReq.user?.id;
    const hardDelete = req.query.hard === 'true';

    if (id === currentUserId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await UserModel.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (hardDelete) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM user_profiles WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'User deleted permanently' });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
      return;
    }

    // Soft delete by setting is_active to false
    await UserModel.update(id, { is_active: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

