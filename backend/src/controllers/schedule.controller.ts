import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getSchedules(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, semesterId, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (semesterId) where.semesterId = semesterId;
    if (search) where.name = { contains: String(search), mode: 'insensitive' };

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        include: {
          semester: true,
          _count: { select: { lessons: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.schedule.count({ where }),
    ]);

    sendPaginated(res, schedules, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get schedules error:', error);
    sendError(res, 'Failed to get schedules', 500);
  }
}

export async function getScheduleById(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: {
        semester: true,
        lessons: {
          include: {
            subject: true,
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            group: true,
            classroom: true,
          },
          orderBy: [{ dayOfWeek: 'asc' }, { lessonNumber: 'asc' }],
        },
      },
    });

    if (!schedule) {
      sendError(res, 'Schedule not found', 404);
      return;
    }

    sendSuccess(res, schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    sendError(res, 'Failed to get schedule', 500);
  }
}

export async function createSchedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    const schedule = await prisma.schedule.create({
      data: {
        ...req.body,
        createdBy: req.user?.userId,
      },
      include: { semester: true },
    });

    sendSuccess(res, schedule, 'Schedule created', 201);
  } catch (error) {
    console.error('Create schedule error:', error);
    sendError(res, 'Failed to create schedule', 500);
  }
}

export async function updateSchedule(req: Request, res: Response): Promise<void> {
  try {
    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: req.body,
      include: { semester: true },
    });

    sendSuccess(res, schedule, 'Schedule updated');
  } catch (error) {
    console.error('Update schedule error:', error);
    sendError(res, 'Failed to update schedule', 500);
  }
}

export async function deleteSchedule(req: Request, res: Response): Promise<void> {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Schedule deleted');
  } catch (error) {
    console.error('Delete schedule error:', error);
    sendError(res, 'Failed to delete schedule', 500);
  }
}

export async function getScheduleByGroup(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;
    const { semesterId } = req.query;

    const where: Record<string, unknown> = { groupId };
    if (semesterId) {
      where.schedule = { semesterId: String(semesterId) };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        classroom: true,
        group: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { lessonNumber: 'asc' }],
    });

    sendSuccess(res, lessons);
  } catch (error) {
    console.error('Get group schedule error:', error);
    sendError(res, 'Failed to get group schedule', 500);
  }
}

export async function getScheduleByTeacher(req: Request, res: Response): Promise<void> {
  try {
    const { teacherId } = req.params;
    const { semesterId } = req.query;

    const where: Record<string, unknown> = { teacherId };
    if (semesterId) {
      where.schedule = { semesterId: String(semesterId) };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        classroom: true,
        group: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { lessonNumber: 'asc' }],
    });

    sendSuccess(res, lessons);
  } catch (error) {
    console.error('Get teacher schedule error:', error);
    sendError(res, 'Failed to get teacher schedule', 500);
  }
}
