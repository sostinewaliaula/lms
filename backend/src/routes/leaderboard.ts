import { Router } from 'express';
import {
  getLeaderboard,
  getUserRank,
  recalculateRanks,
  getLeaderboardStats,
} from '../controllers/leaderboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), getLeaderboardStats);
router.get('/recalculate', authenticate, authorize('admin'), recalculateRanks);
router.get('/user/:userId', authenticate, authorize('admin'), getUserRank);
router.get('/', authenticate, authorize('admin'), getLeaderboard);

export default router;

