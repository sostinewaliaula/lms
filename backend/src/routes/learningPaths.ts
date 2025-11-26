import { Router } from 'express';
import {
  getLearningPaths,
  getLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
} from '../controllers/learningPathController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getLearningPaths);
router.get('/:id', authenticate, authorize('admin'), getLearningPath);
router.post('/', authenticate, authorize('admin'), createLearningPath);
router.put('/:id', authenticate, authorize('admin'), updateLearningPath);
router.delete('/:id', authenticate, authorize('admin'), deleteLearningPath);

export default router;


