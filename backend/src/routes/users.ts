import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getUsers);
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/:id', authenticate, authorize('admin'), getUser);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;

