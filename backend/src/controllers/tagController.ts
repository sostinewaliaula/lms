import { Request, Response } from 'express';
import { TagModel } from '../models/Tag';

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await TagModel.findAll();
    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tag = await TagModel.findById(id);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.json({ tag });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const tag = await TagModel.create({ name, description, icon });
    res.status(201).json({ message: 'Tag created successfully', tag });
  } catch (error: any) {
    console.error('Create tag error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'A tag with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tag = await TagModel.update(id, req.body);
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.json({ message: 'Tag updated successfully', tag });
  } catch (error: any) {
    console.error('Update tag error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'A tag with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await TagModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


