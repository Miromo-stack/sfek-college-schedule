import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification, deleteNotification } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.post('/', authenticate, authorize('ADMIN'), createNotification);
router.delete('/:id', authenticate, deleteNotification);

export default router;
