import { Router } from 'express';
import { processVideo, getVideoMetadata } from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../services/upload';

const router = Router();

router.post('/process', authenticate, authorize('instructor', 'admin'), upload.single('video'), processVideo);
router.get('/metadata/:filename', authenticate, getVideoMetadata);

export default router;


