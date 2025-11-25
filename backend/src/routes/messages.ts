import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversation/:other_user_id', authenticate, getConversation);
router.get('/unread', authenticate, getUnreadCount);

export default router;


