import { Router } from 'express';
import { getTags, getTag, createTag, updateTag, deleteTag } from '../controllers/tagController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getTags);
router.get('/:id', authenticate, authorize('admin'), getTag);
router.post('/', authenticate, authorize('admin'), createTag);
router.put('/:id', authenticate, authorize('admin'), updateTag);
router.delete('/:id', authenticate, authorize('admin'), deleteTag);

export default router;


