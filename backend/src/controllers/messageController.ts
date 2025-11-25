import { Request, Response } from 'express';
import { MessageModel } from '../models/Message';

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const sender_id = authReq.user?.id;

    if (!sender_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { receiver_id, content } = req.body;

    if (sender_id === receiver_id) {
      res.status(400).json({ error: 'Cannot send message to yourself' });
      return;
    }

    const message = await MessageModel.create({
      sender_id,
      receiver_id,
      content,
    });

    // Emit socket event for real-time messaging
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`user:${receiver_id}`).emit('new_message', message);
    }

    res.status(201).json({ message: 'Message sent successfully', message: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { other_user_id } = req.params;
    const messages = await MessageModel.findByUsers(user_id, other_user_id);

    // Mark messages as read
    const unreadIds = messages
      .filter((m) => m.receiver_id === user_id && !m.is_read)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      await MessageModel.markAsRead(unreadIds, user_id);
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const conversations = await MessageModel.findConversations(user_id);
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const count = await MessageModel.getUnreadCount(user_id);
    res.json({ unread_count: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


