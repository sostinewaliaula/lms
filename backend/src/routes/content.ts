import { Router } from 'express';
import {
  createModule,
  getModules,
  updateModule,
  deleteModule,
  createContent,
  getContent,
  updateContent,
  deleteContent,
  createQuiz,
  addQuizQuestion,
  submitQuiz,
} from '../controllers/contentController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../services/upload';

const router = Router();

// Module routes
router.post('/modules', authenticate, authorize('instructor', 'admin'), createModule);
router.get('/modules/:course_id', getModules);
router.put('/modules/:id', authenticate, authorize('instructor', 'admin'), updateModule);
router.delete('/modules/:id', authenticate, authorize('instructor', 'admin'), deleteModule);

// Content routes
router.post('/items', authenticate, authorize('instructor', 'admin'), upload.single('file'), createContent);
router.get('/items/:id', getContent);
router.put('/items/:id', authenticate, authorize('instructor', 'admin'), upload.single('file'), updateContent);
router.delete('/items/:id', authenticate, authorize('instructor', 'admin'), deleteContent);

// Quiz routes
router.post('/quizzes', authenticate, authorize('instructor', 'admin'), createQuiz);
router.post('/quizzes/:quiz_id/questions', authenticate, authorize('instructor', 'admin'), addQuizQuestion);
router.post('/quizzes/:quiz_id/submit', authenticate, submitQuiz);

export default router;


