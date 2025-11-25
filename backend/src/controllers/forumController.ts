import { Request, Response } from 'express';
import { ForumModel, ForumPostModel } from '../models/Forum';

export const createThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const thread = await ForumModel.create({
      ...req.body,
      user_id,
    });

    res.status(201).json({ message: 'Thread created successfully', thread });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getThreads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id } = req.params;
    const threads = await ForumModel.findByCourse(course_id);
    res.json({ threads });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const thread = await ForumModel.findById(id);

    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    const posts = await ForumPostModel.findByForum(id);
    (thread as any).posts = posts;

    res.json({ thread });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { forum_id, content } = req.body;

    // Check if thread is locked
    const thread = await ForumModel.findById(forum_id);
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    if (thread.is_locked) {
      res.status(403).json({ error: 'Thread is locked' });
      return;
    }

    const post = await ForumPostModel.create({
      forum_id,
      user_id,
      content,
    });

    // Emit socket event for real-time update
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`forum:${forum_id}`).emit('new_post', post);
    }

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as any;
    const user_id = authReq.user?.id;
    const user_role = authReq.user?.role;

    const thread = await ForumModel.findById(id);
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    // Check permissions
    if (thread.user_id !== user_id && user_role !== 'admin' && user_role !== 'instructor') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updated = await ForumModel.update(id, req.body);
    res.json({ message: 'Thread updated successfully', thread: updated });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteThread = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as any;
    const user_id = authReq.user?.id;
    const user_role = authReq.user?.role;

    const thread = await ForumModel.findById(id);
    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    // Check permissions
    if (thread.user_id !== user_id && user_role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await ForumModel.delete(id);
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


