import { Request, Response } from 'express';
import { LearningPathModel } from '../models/LearningPath';

export const getLearningPaths = async (req: Request, res: Response): Promise<void> => {
  try {
    const paths = await LearningPathModel.findAll();
    res.json({ paths });
  } catch (error) {
    console.error('Get learning paths error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const path = await LearningPathModel.findById(id);
    if (!path) {
      res.status(404).json({ error: 'Learning path not found' });
      return;
    }
    res.json({ path });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, thumbnail_url, difficulty_level, estimated_duration_hours, is_published, course_ids } =
      req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const path = await LearningPathModel.create({
      title,
      description,
      thumbnail_url,
      difficulty_level,
      estimated_duration_hours,
      is_published,
    });

    if (Array.isArray(course_ids) && course_ids.length > 0) {
      await LearningPathModel.replaceCourses(path.id, course_ids);
    }

    const fullPath = await LearningPathModel.findById(path.id);
    res.status(201).json({ message: 'Learning path created successfully', path: fullPath });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { course_ids, ...updates } = req.body;

    const path = await LearningPathModel.update(id, updates);
    if (!path) {
      res.status(404).json({ error: 'Learning path not found' });
      return;
    }

    if (Array.isArray(course_ids)) {
      await LearningPathModel.replaceCourses(id, course_ids);
    }

    const fullPath = await LearningPathModel.findById(id);
    res.json({ message: 'Learning path updated successfully', path: fullPath });
  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLearningPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await LearningPathModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Learning path not found' });
      return;
    }
    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Delete learning path error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


