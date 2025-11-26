import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, type, is_read } = req.query;
    
    const filters: any = {};
    if (user_id) filters.user_id = user_id as string;
    if (type) filters.type = type as string;
    if (is_read !== undefined) {
      filters.is_read = is_read === 'true' || is_read === '1';
    }

    const notifications = await NotificationModel.findAll(filters);
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, type, title, message, link } = req.body;

    if (!user_id || !type || !title) {
      res.status(400).json({ error: 'user_id, type, and title are required' });
      return;
    }

    const notification = await NotificationModel.create({
      user_id,
      type,
      title,
      message,
      link,
    });
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await NotificationModel.update(id, req.body);
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification updated successfully', notification });
  } catch (error: any) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await NotificationModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.markAsRead(id);
    if (!updated) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNotificationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await NotificationModel.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

