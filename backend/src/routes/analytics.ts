import { Router } from 'express';
import {
  getDashboardStats,
  getCourseAnalytics,
  getUserEngagement,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/course/:course_id', authenticate, authorize('admin', 'instructor'), getCourseAnalytics);
router.get('/user/engagement', authenticate, getUserEngagement);

export default router;


