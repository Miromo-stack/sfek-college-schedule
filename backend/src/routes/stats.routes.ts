import { Router } from 'express';
import { getDashboardStats, getTeacherStats } from '../controllers/stats.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);
router.get('/teacher/:teacherId', authenticate, getTeacherStats);

export default router;
