import { Router } from 'express';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { subjectSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getSubjects);
router.get('/:id', authenticate, getSubjectById);
router.post('/', authenticate, authorize('ADMIN'), validate(subjectSchema), createSubject);
router.patch('/:id', authenticate, authorize('ADMIN'), updateSubject);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSubject);

export default router;
