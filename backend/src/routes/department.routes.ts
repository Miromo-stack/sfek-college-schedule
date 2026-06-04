import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { departmentSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getDepartments);
router.get('/:id', authenticate, getDepartmentById);
router.post('/', authenticate, authorize('ADMIN'), validate(departmentSchema), createDepartment);
router.patch('/:id', authenticate, authorize('ADMIN'), updateDepartment);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteDepartment);

export default router;
