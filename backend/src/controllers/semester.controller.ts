import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getSemesters(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [semesters, total] = await Promise.all([
      prisma.semester.findMany({
        include: { _count: { select: { schedules: true } } },
        skip,
        take: Number(limit),
        orderBy: { startDate: 'desc' },
      }),
      prisma.semester.count(),
    ]);

    sendPaginated(res, semesters, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get semesters error:', error);
    sendError(res, 'Failed to get semesters', 500);
  }
}

export async function getSemesterById(req: Request, res: Response): Promise<void> {
  try {
    const semester = await prisma.semester.findUnique({
      where: { id: req.params.id },
      include: { schedules: true },
    });

    if (!semester) {
      sendError(res, 'Semester not found', 404);
      return;
    }

    sendSuccess(res, semester);
  } catch (error) {
    console.error('Get semester error:', error);
    sendError(res, 'Failed to get semester', 500);
  }
}

export async function createSemester(req: Request, res: Response): Promise<void> {
  try {
    const semester = await prisma.semester.create({ data: req.body });
    sendSuccess(res, semester, 'Semester created', 201);
  } catch (error) {
    console.error('Create semester error:', error);
    sendError(res, 'Failed to create semester', 500);
  }
}

export async function updateSemester(req: Request, res: Response): Promise<void> {
  try {
    const semester = await prisma.semester.update({
      where: { id: req.params.id },
      data: req.body,
    });

    sendSuccess(res, semester, 'Semester updated');
  } catch (error) {
    console.error('Update semester error:', error);
    sendError(res, 'Failed to update semester', 500);
  }
}

export async function setCurrentSemester(req: Request, res: Response): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.semester.updateMany({ data: { isCurrent: false } });
      await tx.semester.update({
        where: { id: req.params.id },
        data: { isCurrent: true, status: 'ACTIVE' },
      });
    });

    sendSuccess(res, null, 'Current semester updated');
  } catch (error) {
    console.error('Set current semester error:', error);
    sendError(res, 'Failed to set current semester', 500);
  }
}

export async function deleteSemester(req: Request, res: Response): Promise<void> {
  try {
    await prisma.semester.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Semester deleted');
  } catch (error) {
    console.error('Delete semester error:', error);
    sendError(res, 'Failed to delete semester', 500);
  }
}
