import { Router } from 'express';
import { getSkills, getSkill, createSkill, updateSkill, deleteSkill } from '../controllers/skillController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getSkills);
router.get('/:id', authenticate, authorize('admin'), getSkill);
router.post('/', authenticate, authorize('admin'), createSkill);
router.put('/:id', authenticate, authorize('admin'), updateSkill);
router.delete('/:id', authenticate, authorize('admin'), deleteSkill);

export default router;


