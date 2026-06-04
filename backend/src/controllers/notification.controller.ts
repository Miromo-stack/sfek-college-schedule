import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { userId: req.user.userId };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: { select: { firstName: true, lastName: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    sendPaginated(res, notifications, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 'Failed to get notifications', 500);
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const count = await prisma.notification.count({
      where: { userId: req.user.userId, isRead: false },
    });

    sendSuccess(res, { count });
  } catch (error) {
    console.error('Get unread count error:', error);
    sendError(res, 'Failed to get unread count', 500);
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    sendError(res, 'Failed to mark as read', 500);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all as read error:', error);
    sendError(res, 'Failed to mark all as read', 500);
  }
}

export async function createNotification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notification = await prisma.notification.create({
      data: {
        ...req.body,
        senderId: req.user?.userId,
      },
    });

    sendSuccess(res, notification, 'Notification sent', 201);
  } catch (error) {
    console.error('Create notification error:', error);
    sendError(res, 'Failed to create notification', 500);
  }
}

export async function deleteNotification(req: Request, res: Response): Promise<void> {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    sendError(res, 'Failed to delete notification', 500);
  }
}
