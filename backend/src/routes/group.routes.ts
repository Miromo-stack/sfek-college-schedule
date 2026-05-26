import { Router } from 'express';
import { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } from '../controllers/group.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { groupSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getGroups);
router.get('/:id', authenticate, getGroupById);
router.post('/', authenticate, authorize('ADMIN'), validate(groupSchema), createGroup);
router.patch('/:id', authenticate, authorize('ADMIN'), updateGroup);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteGroup);

export default router;
