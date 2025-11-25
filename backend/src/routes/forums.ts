import { Router } from 'express';
import {
  createThread,
  getThreads,
  getThread,
  createPost,
  updateThread,
  deleteThread,
} from '../controllers/forumController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/course/:course_id', getThreads);
router.get('/:id', getThread);
router.post('/', authenticate, createThread);
router.post('/:forum_id/posts', authenticate, createPost);
router.put('/:id', authenticate, updateThread);
router.delete('/:id', authenticate, deleteThread);

export default router;


