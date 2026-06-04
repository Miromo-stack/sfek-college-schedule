import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getTeachers(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, search, departmentId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (departmentId) where.departmentId = String(departmentId);
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ],
      };
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true, phone: true, isActive: true, avatar: true } },
          department: true,
          subjects: { include: { subject: true } },
          _count: { select: { lessons: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { user: { lastName: 'asc' } },
      }),
      prisma.teacher.count({ where }),
    ]);

    sendPaginated(res, teachers, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get teachers error:', error);
    sendError(res, 'Failed to get teachers', 500);
  }
}

export async function getTeacherById(req: Request, res: Response): Promise<void> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true, phone: true, isActive: true, avatar: true } },
        department: true,
        subjects: { include: { subject: true } },
        lessons: {
          include: {
            subject: true,
            group: true,
            classroom: true,
          },
        },
      },
    });

    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    sendSuccess(res, teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    sendError(res, 'Failed to get teacher', 500);
  }
}

export async function createTeacher(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, middleName, phone, departmentId, employeeId, position, specialization } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'Teacher123!', 12);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          middleName,
          phone,
          role: 'TEACHER',
        },
      });

      return tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          departmentId,
          position,
          specialization,
        },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true } },
          department: true,
        },
      });
    });

    sendSuccess(res, teacher, 'Teacher created', 201);
  } catch (error) {
    console.error('Create teacher error:', error);
    sendError(res, 'Failed to create teacher', 500);
  }
}

export async function updateTeacher(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, phone, email, departmentId, position, specialization } = req.body;

    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (firstName || lastName || middleName || phone || email) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: { firstName, lastName, middleName, phone, email },
        });
      }

      return tx.teacher.update({
        where: { id },
        data: { departmentId, position, specialization },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true } },
          department: true,
        },
      });
    });

    sendSuccess(res, result, 'Teacher updated');
  } catch (error) {
    console.error('Update teacher error:', error);
    sendError(res, 'Failed to update teacher', 500);
  }
}

export async function deleteTeacher(req: Request, res: Response): Promise<void> {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({ where: { id: req.params.id } });
      await tx.user.delete({ where: { id: teacher.userId } });
    });

    sendSuccess(res, null, 'Teacher deleted');
  } catch (error) {
    console.error('Delete teacher error:', error);
    sendError(res, 'Failed to delete teacher', 500);
  }
}
