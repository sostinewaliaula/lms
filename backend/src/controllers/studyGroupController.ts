import { Request, Response } from 'express';
import { StudyGroupModel } from '../models/StudyGroup';

export const getStudyGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id, created_by } = req.query;
    
    const filters: any = {};
    if (course_id) filters.course_id = course_id as string;
    if (created_by) filters.created_by = created_by as string;

    const groups = await StudyGroupModel.findAll(filters);
    res.json({ groups });
  } catch (error) {
    console.error('Get study groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudyGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await StudyGroupModel.findById(id);
    if (!group) {
      res.status(404).json({ error: 'Study group not found' });
      return;
    }
    res.json({ group });
  } catch (error) {
    console.error('Get study group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudyGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id, name, description, max_members } = req.body;
    const created_by = (req as any).user?.id;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!created_by) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const group = await StudyGroupModel.create({
      course_id,
      name,
      description,
      max_members,
      created_by,
    });
    res.status(201).json({ message: 'Study group created successfully', group });
  } catch (error: any) {
    console.error('Create study group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudyGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await StudyGroupModel.update(id, req.body);
    if (!group) {
      res.status(404).json({ error: 'Study group not found' });
      return;
    }
    res.json({ message: 'Study group updated successfully', group });
  } catch (error: any) {
    console.error('Update study group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudyGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await StudyGroupModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Study group not found' });
      return;
    }
    res.json({ message: 'Study group deleted successfully' });
  } catch (error) {
    console.error('Delete study group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const members = await StudyGroupModel.getMembers(id);
    res.json({ members });
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addGroupMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const added = await StudyGroupModel.addMember(id, user_id, role || 'member');
    if (!added) {
      res.status(409).json({ error: 'User is already a member of this group' });
      return;
    }
    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add group member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeGroupMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const removed = await StudyGroupModel.removeMember(id, userId);
    if (!removed) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove group member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'member'].includes(role)) {
      res.status(400).json({ error: 'Valid role (admin or member) is required' });
      return;
    }

    const updated = await StudyGroupModel.updateMemberRole(id, userId, role);
    if (!updated) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

