import { Router } from 'express';
import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '../controllers/achievementController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getAchievements);
router.get('/:id', authenticate, authorize('admin'), getAchievement);
router.post('/', authenticate, authorize('admin'), createAchievement);
router.put('/:id', authenticate, authorize('admin'), updateAchievement);
router.delete('/:id', authenticate, authorize('admin'), deleteAchievement);

export default router;

