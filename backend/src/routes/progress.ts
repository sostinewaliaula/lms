import { Router } from 'express';
import {
  updateProgress,
  getProgress,
  getCertificates,
  getCertificate,
} from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, updateProgress);
router.get('/course/:course_id', authenticate, getProgress);
router.get('/certificates', authenticate, getCertificates);
router.get('/certificates/:course_id', authenticate, getCertificate);

export default router;


