import { Router } from 'express';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  getNotificationStats,
} from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), getNotificationStats);
router.get('/', authenticate, authorize('admin'), getNotifications);
router.get('/:id', authenticate, authorize('admin'), getNotification);
router.post('/', authenticate, authorize('admin'), createNotification);
router.put('/:id', authenticate, authorize('admin'), updateNotification);
router.put('/:id/read', authenticate, authorize('admin'), markAsRead);
router.delete('/:id', authenticate, authorize('admin'), deleteNotification);

export default router;

