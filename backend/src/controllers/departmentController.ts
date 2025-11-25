import { Request, Response } from 'express';
import { DepartmentModel } from '../models/Department';
import pool from '../config/database';
import { getAllRows } from '../utils/db';

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = await DepartmentModel.create(req.body);
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await DepartmentModel.findAll();
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await DepartmentModel.findById(id);

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    // Get department stats
    const stats = await DepartmentModel.getStats(id);
    (department as any).stats = stats;

    // Get courses in this department
    const [coursesResult] = await pool.query(
      'SELECT id, title, slug, thumbnail_url, enrolled_count FROM courses WHERE department_id = ?',
      [id]
    );
    (department as any).courses = getAllRows(coursesResult);

    // Get users in this department
    const [usersResult] = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE department_id = ?',
      [id]
    );
    (department as any).users = getAllRows(usersResult);

    res.json({ department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await DepartmentModel.update(id, req.body);

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await DepartmentModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

