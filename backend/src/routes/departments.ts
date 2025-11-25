import { Router } from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.post('/', authenticate, authorize('admin'), createDepartment);
router.put('/:id', authenticate, authorize('admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), deleteDepartment);

export default router;

