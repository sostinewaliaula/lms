import { Router } from 'express';
import {
  getReviews,
  getReview,
  deleteReview,
  getReviewStats,
} from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), getReviewStats);
router.get('/', authenticate, authorize('admin'), getReviews);
router.get('/:id', authenticate, authorize('admin'), getReview);
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

export default router;

