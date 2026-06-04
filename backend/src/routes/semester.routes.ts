import { Router } from 'express';
import { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester, setCurrentSemester } from '../controllers/semester.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { semesterSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getSemesters);
router.get('/:id', authenticate, getSemesterById);
router.post('/', authenticate, authorize('ADMIN'), validate(semesterSchema), createSemester);
router.patch('/:id', authenticate, authorize('ADMIN'), updateSemester);
router.patch('/:id/set-current', authenticate, authorize('ADMIN'), setCurrentSemester);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSemester);

export default router;
