import { Router } from 'express';
import {
  getBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge,
} from '../controllers/badgeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getBadges);
router.get('/:id', authenticate, authorize('admin'), getBadge);
router.post('/', authenticate, authorize('admin'), createBadge);
router.put('/:id', authenticate, authorize('admin'), updateBadge);
router.delete('/:id', authenticate, authorize('admin'), deleteBadge);

export default router;

