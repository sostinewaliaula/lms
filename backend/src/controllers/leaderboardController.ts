import { Request, Response } from 'express';
import { LeaderboardModel } from '../models/Leaderboard';

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const entries = await LeaderboardModel.findAll(limitNum);
    res.json({ leaderboard: entries });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const entry = await LeaderboardModel.findByUserId(userId);
    if (!entry) {
      res.status(404).json({ error: 'User not found in leaderboard' });
      return;
    }
    res.json({ entry });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recalculateRanks = async (req: Request, res: Response): Promise<void> => {
  try {
    await LeaderboardModel.recalculateRanks();
    res.json({ message: 'Leaderboard ranks recalculated successfully' });
  } catch (error) {
    console.error('Recalculate ranks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLeaderboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await LeaderboardModel.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

