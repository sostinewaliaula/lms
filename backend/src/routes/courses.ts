import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyCourses,
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getCourses);
router.get('/my-courses', authenticate, getMyCourses);
router.get('/:id', getCourse);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourse);
router.put('/:id', authenticate, updateCourse);
router.delete('/:id', authenticate, deleteCourse);
router.post('/enroll', authenticate, enrollInCourse);

export default router;


