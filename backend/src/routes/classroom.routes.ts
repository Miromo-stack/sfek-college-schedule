import { Router } from 'express';
import { getClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom } from '../controllers/classroom.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { classroomSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getClassrooms);
router.get('/:id', authenticate, getClassroomById);
router.post('/', authenticate, authorize('ADMIN'), validate(classroomSchema), createClassroom);
router.patch('/:id', authenticate, authorize('ADMIN'), updateClassroom);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteClassroom);

export default router;
