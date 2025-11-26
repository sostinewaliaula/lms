import { Router } from 'express';
import {
  getStudyGroups,
  getStudyGroup,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
} from '../controllers/studyGroupController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), getStudyGroups);
router.get('/:id', authenticate, authorize('admin'), getStudyGroup);
router.post('/', authenticate, authorize('admin'), createStudyGroup);
router.put('/:id', authenticate, authorize('admin'), updateStudyGroup);
router.delete('/:id', authenticate, authorize('admin'), deleteStudyGroup);

// Member management
router.get('/:id/members', authenticate, authorize('admin'), getGroupMembers);
router.post('/:id/members', authenticate, authorize('admin'), addGroupMember);
router.delete('/:id/members/:userId', authenticate, authorize('admin'), removeGroupMember);
router.put('/:id/members/:userId/role', authenticate, authorize('admin'), updateMemberRole);

export default router;

