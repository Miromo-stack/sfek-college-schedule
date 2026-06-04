import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 50, search, departmentId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { isActive: true };
    if (departmentId) where.departmentId = String(departmentId);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: {
          department: true,
          _count: { select: { lessons: true, teachers: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.subject.count({ where }),
    ]);

    sendPaginated(res, subjects, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get subjects error:', error);
    sendError(res, 'Failed to get subjects', 500);
  }
}

export async function getSubjectById(req: Request, res: Response): Promise<void> {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
    });

    if (!subject) {
      sendError(res, 'Subject not found', 404);
      return;
    }

    sendSuccess(res, subject);
  } catch (error) {
    console.error('Get subject error:', error);
    sendError(res, 'Failed to get subject', 500);
  }
}

export async function createSubject(req: Request, res: Response): Promise<void> {
  try {
    const subject = await prisma.subject.create({
      data: req.body,
      include: { department: true },
    });

    sendSuccess(res, subject, 'Subject created', 201);
  } catch (error) {
    console.error('Create subject error:', error);
    sendError(res, 'Failed to create subject', 500);
  }
}

export async function updateSubject(req: Request, res: Response): Promise<void> {
  try {
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: req.body,
      include: { department: true },
    });

    sendSuccess(res, subject, 'Subject updated');
  } catch (error) {
    console.error('Update subject error:', error);
    sendError(res, 'Failed to update subject', 500);
  }
}

export async function deleteSubject(req: Request, res: Response): Promise<void> {
  try {
    await prisma.subject.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Subject deleted');
  } catch (error) {
    console.error('Delete subject error:', error);
    sendError(res, 'Failed to delete subject', 500);
  }
}
