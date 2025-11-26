import { Request, Response } from 'express';
import { AchievementModel } from '../models/Achievement';

export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const achievements = await AchievementModel.findAll();
    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const achievement = await AchievementModel.findById(id);
    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }
    res.json({ achievement });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon_url, points, criteria } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const achievement = await AchievementModel.create({
      name,
      description,
      icon_url,
      points: points || 0,
      criteria,
    });
    res.status(201).json({ message: 'Achievement created successfully', achievement });
  } catch (error: any) {
    console.error('Create achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const achievement = await AchievementModel.update(id, req.body);
    if (!achievement) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }
    res.json({ message: 'Achievement updated successfully', achievement });
  } catch (error: any) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await AchievementModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Achievement not found' });
      return;
    }
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

