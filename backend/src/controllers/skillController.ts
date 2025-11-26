import { Request, Response } from 'express';
import { SkillModel } from '../models/Skill';

export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await SkillModel.findAll();
    res.json({ skills });
  } catch (error) {
    echoerror('Get skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const skill = await SkillModel.findById(id);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json({ skill });
  } catch (error) {
    console.error('Get skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parent_skill_id } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const skill = await SkillModel.create({ name, description, parent_skill_id });
    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error: any) {
    console.error('Create skill error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'A skill with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const skill = await SkillModel.update(id, req.body);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json({ message: 'Skill updated successfully', skill });
  } catch (error: any) {
    console.error('Update skill error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'A skill with this name or slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await SkillModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


