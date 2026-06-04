import { Router } from 'express';
import { getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule, getScheduleByGroup, getScheduleByTeacher } from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { scheduleSchema } from '../utils/validators';

const router = Router();

router.get('/', authenticate, getSchedules);
router.get('/:id', authenticate, getScheduleById);
router.post('/', authenticate, authorize('ADMIN'), validate(scheduleSchema), createSchedule);
router.patch('/:id', authenticate, authorize('ADMIN'), updateSchedule);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSchedule);
router.get('/group/:groupId', authenticate, getScheduleByGroup);
router.get('/teacher/:teacherId', authenticate, getScheduleByTeacher);

export default router;
