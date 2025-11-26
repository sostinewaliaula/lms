import { Request, Response } from 'express';
import { BadgeModel } from '../models/Badge';

export const getBadges = async (req: Request, res: Response): Promise<void> => {
  try {
    const badges = await BadgeModel.findAll();
    res.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const badge = await BadgeModel.findById(id);
    if (!badge) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }
    res.json({ badge });
  } catch (error) {
    console.error('Get badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon_url, badge_type, criteria } = req.body;
    if (!name || !badge_type) {
      res.status(400).json({ error: 'Name and badge_type are required' });
      return;
    }
    const badge = await BadgeModel.create({
      name,
      description,
      icon_url,
      badge_type,
      criteria,
    });
    res.status(201).json({ message: 'Badge created successfully', badge });
  } catch (error: any) {
    console.error('Create badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const badge = await BadgeModel.update(id, req.body);
    if (!badge) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }
    res.json({ message: 'Badge updated successfully', badge });
  } catch (error: any) {
    console.error('Update badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await BadgeModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Badge not found' });
      return;
    }
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Delete badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

