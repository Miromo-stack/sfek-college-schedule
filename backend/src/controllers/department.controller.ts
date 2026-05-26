import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getDepartments(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          _count: { select: { teachers: true, subjects: true, groups: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.department.count({ where }),
    ]);

    sendPaginated(res, departments, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get departments error:', error);
    sendError(res, 'Failed to get departments', 500);
  }
}

export async function getDepartmentById(req: Request, res: Response): Promise<void> {
  try {
    const department = await prisma.department.findUnique({
      where: { id: req.params.id },
      include: {
        teachers: { include: { user: { select: { firstName: true, lastName: true } } } },
        subjects: true,
        groups: true,
      },
    });

    if (!department) {
      sendError(res, 'Department not found', 404);
      return;
    }

    sendSuccess(res, department);
  } catch (error) {
    console.error('Get department error:', error);
    sendError(res, 'Failed to get department', 500);
  }
}

export async function createDepartment(req: Request, res: Response): Promise<void> {
  try {
    const department = await prisma.department.create({ data: req.body });
    sendSuccess(res, department, 'Department created', 201);
  } catch (error) {
    console.error('Create department error:', error);
    sendError(res, 'Failed to create department', 500);
  }
}

export async function updateDepartment(req: Request, res: Response): Promise<void> {
  try {
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body,
    });

    sendSuccess(res, department, 'Department updated');
  } catch (error) {
    console.error('Update department error:', error);
    sendError(res, 'Failed to update department', 500);
  }
}

export async function deleteDepartment(req: Request, res: Response): Promise<void> {
  try {
    await prisma.department.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Department deleted');
  } catch (error) {
    console.error('Delete department error:', error);
    sendError(res, 'Failed to delete department', 500);
  }
}
