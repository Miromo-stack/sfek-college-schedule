import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { DayOfWeek } from '@prisma/client';

interface ConflictResult {
  type: 'teacher' | 'classroom' | 'group';
  message: string;
  conflictingLesson: Record<string, unknown>;
}

async function checkConflicts(
  teacherId: string,
  classroomId: string,
  groupId: string,
  dayOfWeek: DayOfWeek,
  lessonNumber: number,
  scheduleId: string,
  excludeId?: string
): Promise<ConflictResult[]> {
  const conflicts: ConflictResult[] = [];
  const baseWhere = {
    dayOfWeek,
    lessonNumber,
    scheduleId,
    ...(excludeId ? { NOT: { id: excludeId } } : {}),
  };

  const teacherConflict = await prisma.lesson.findFirst({
    where: { ...baseWhere, teacherId },
    include: { subject: true, group: true },
  });

  if (teacherConflict) {
    conflicts.push({
      type: 'teacher',
      message: `Teacher already has a lesson at this time (${teacherConflict.subject.name} with group ${teacherConflict.group.name})`,
      conflictingLesson: teacherConflict as unknown as Record<string, unknown>,
    });
  }

  const classroomConflict = await prisma.lesson.findFirst({
    where: { ...baseWhere, classroomId },
    include: { subject: true, group: true },
  });

  if (classroomConflict) {
    conflicts.push({
      type: 'classroom',
      message: `Classroom is already occupied at this time (${classroomConflict.subject.name} with group ${classroomConflict.group.name})`,
      conflictingLesson: classroomConflict as unknown as Record<string, unknown>,
    });
  }

  const groupConflict = await prisma.lesson.findFirst({
    where: { ...baseWhere, groupId },
    include: { subject: true, teacher: { include: { user: true } } },
  });

  if (groupConflict) {
    conflicts.push({
      type: 'group',
      message: `Group already has a lesson at this time (${groupConflict.subject.name})`,
      conflictingLesson: groupConflict as unknown as Record<string, unknown>,
    });
  }

  return conflicts;
}

export async function createLesson(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;

    const conflicts = await checkConflicts(
      data.teacherId,
      data.classroomId,
      data.groupId,
      data.dayOfWeek,
      data.lessonNumber,
      data.scheduleId
    );

    if (conflicts.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Schedule conflicts detected',
        conflicts,
      });
      return;
    }

    const lesson = await prisma.lesson.create({
      data,
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        group: true,
        classroom: true,
      },
    });

    sendSuccess(res, lesson, 'Lesson created', 201);
  } catch (error) {
    console.error('Create lesson error:', error);
    sendError(res, 'Failed to create lesson', 500);
  }
}

export async function updateLesson(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.teacherId || data.classroomId || data.groupId || data.dayOfWeek || data.lessonNumber) {
      const existing = await prisma.lesson.findUnique({ where: { id } });
      if (!existing) {
        sendError(res, 'Lesson not found', 404);
        return;
      }

      const conflicts = await checkConflicts(
        data.teacherId || existing.teacherId,
        data.classroomId || existing.classroomId,
        data.groupId || existing.groupId,
        data.dayOfWeek || existing.dayOfWeek,
        data.lessonNumber || existing.lessonNumber,
        data.scheduleId || existing.scheduleId,
        id
      );

      if (conflicts.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Schedule conflicts detected',
          conflicts,
        });
        return;
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data,
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        group: true,
        classroom: true,
      },
    });

    sendSuccess(res, lesson, 'Lesson updated');
  } catch (error) {
    console.error('Update lesson error:', error);
    sendError(res, 'Failed to update lesson', 500);
  }
}

export async function deleteLesson(req: Request, res: Response): Promise<void> {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Lesson deleted');
  } catch (error) {
    console.error('Delete lesson error:', error);
    sendError(res, 'Failed to delete lesson', 500);
  }
}

export async function getLessons(req: Request, res: Response): Promise<void> {
  try {
    const { scheduleId, dayOfWeek, teacherId, groupId, classroomId } = req.query;

    const where: Record<string, unknown> = {};
    if (scheduleId) where.scheduleId = String(scheduleId);
    if (dayOfWeek) where.dayOfWeek = String(dayOfWeek);
    if (teacherId) where.teacherId = String(teacherId);
    if (groupId) where.groupId = String(groupId);
    if (classroomId) where.classroomId = String(classroomId);

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        subject: true,
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        group: true,
        classroom: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { lessonNumber: 'asc' }],
    });

    sendSuccess(res, lessons);
  } catch (error) {
    console.error('Get lessons error:', error);
    sendError(res, 'Failed to get lessons', 500);
  }
}

export async function checkLessonConflicts(req: Request, res: Response): Promise<void> {
  try {
    const { teacherId, classroomId, groupId, dayOfWeek, lessonNumber, scheduleId, excludeId } = req.body;

    const conflicts = await checkConflicts(
      teacherId,
      classroomId,
      groupId,
      dayOfWeek as DayOfWeek,
      lessonNumber,
      scheduleId,
      excludeId
    );

    sendSuccess(res, { hasConflicts: conflicts.length > 0, conflicts });
  } catch (error) {
    console.error('Check conflicts error:', error);
    sendError(res, 'Failed to check conflicts', 500);
  }
}
