import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getClassrooms(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 50, search, building, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { isActive: true };
    if (building) where.building = String(building);
    if (type) where.type = String(type);
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    const [classrooms, total] = await Promise.all([
      prisma.classroom.findMany({
        where,
        include: {
          _count: { select: { lessons: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.classroom.count({ where }),
    ]);

    sendPaginated(res, classrooms, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get classrooms error:', error);
    sendError(res, 'Failed to get classrooms', 500);
  }
}

export async function getClassroomById(req: Request, res: Response): Promise<void> {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: {
          include: {
            subject: true,
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            group: true,
          },
        },
      },
    });

    if (!classroom) {
      sendError(res, 'Classroom not found', 404);
      return;
    }

    sendSuccess(res, classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    sendError(res, 'Failed to get classroom', 500);
  }
}

export async function createClassroom(req: Request, res: Response): Promise<void> {
  try {
    const classroom = await prisma.classroom.create({ data: req.body });
    sendSuccess(res, classroom, 'Classroom created', 201);
  } catch (error) {
    console.error('Create classroom error:', error);
    sendError(res, 'Failed to create classroom', 500);
  }
}

export async function updateClassroom(req: Request, res: Response): Promise<void> {
  try {
    const classroom = await prisma.classroom.update({
      where: { id: req.params.id },
      data: req.body,
    });

    sendSuccess(res, classroom, 'Classroom updated');
  } catch (error) {
    console.error('Update classroom error:', error);
    sendError(res, 'Failed to update classroom', 500);
  }
}

export async function deleteClassroom(req: Request, res: Response): Promise<void> {
  try {
    await prisma.classroom.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Classroom deleted');
  } catch (error) {
    console.error('Delete classroom error:', error);
    sendError(res, 'Failed to delete classroom', 500);
  }
}
