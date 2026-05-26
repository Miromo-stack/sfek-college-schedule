import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, toggleFavoriteSubject } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getStudents);
router.get('/:id', authenticate, getStudentById);
router.post('/', authenticate, authorize('ADMIN'), createStudent);
router.patch('/:id', authenticate, authorize('ADMIN'), updateStudent);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStudent);
router.post('/:studentId/favorites/:subjectId', authenticate, toggleFavoriteSubject);

export default router;
