import { Router } from 'express';
import { getLessons, createLesson, updateLesson, deleteLesson, checkLessonConflicts } from '../controllers/lesson.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { lessonSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getLessons);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), validate(lessonSchema), createLesson);
router.patch('/:id', authenticate, authorize('ADMIN', 'TEACHER'), updateLesson);
router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER'), deleteLesson);
router.post('/check-conflicts', authenticate, checkLessonConflicts);

export default router;
