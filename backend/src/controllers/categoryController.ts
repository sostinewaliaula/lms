import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await CategoryModel.create(req.body);
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.update(id, req.body);

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await CategoryModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


