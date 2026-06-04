import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getGroups(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 50, search, departmentId, course } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { isActive: true };
    if (departmentId) where.departmentId = String(departmentId);
    if (course) where.course = Number(course);
    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        include: {
          department: true,
          _count: { select: { students: true, lessons: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.group.count({ where }),
    ]);

    sendPaginated(res, groups, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get groups error:', error);
    sendError(res, 'Failed to get groups', 500);
  }
}

export async function getGroupById(req: Request, res: Response): Promise<void> {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        students: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
    });

    if (!group) {
      sendError(res, 'Group not found', 404);
      return;
    }

    sendSuccess(res, group);
  } catch (error) {
    console.error('Get group error:', error);
    sendError(res, 'Failed to get group', 500);
  }
}

export async function createGroup(req: Request, res: Response): Promise<void> {
  try {
    const group = await prisma.group.create({
      data: req.body,
      include: { department: true },
    });

    sendSuccess(res, group, 'Group created', 201);
  } catch (error) {
    console.error('Create group error:', error);
    sendError(res, 'Failed to create group', 500);
  }
}

export async function updateGroup(req: Request, res: Response): Promise<void> {
  try {
    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: req.body,
      include: { department: true },
    });

    sendSuccess(res, group, 'Group updated');
  } catch (error) {
    console.error('Update group error:', error);
    sendError(res, 'Failed to update group', 500);
  }
}

export async function deleteGroup(req: Request, res: Response): Promise<void> {
  try {
    await prisma.group.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Group deleted');
  } catch (error) {
    console.error('Delete group error:', error);
    sendError(res, 'Failed to delete group', 500);
  }
}
