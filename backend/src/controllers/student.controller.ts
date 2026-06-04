import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, search, groupId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Record<string, unknown> = {};
    if (groupId) where.groupId = String(groupId);
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ],
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true, phone: true, isActive: true } },
          group: { include: { department: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { user: { lastName: 'asc' } },
      }),
      prisma.student.count({ where }),
    ]);

    sendPaginated(res, students, { page: Number(page), limit: Number(limit), total });
  } catch (error) {
    console.error('Get students error:', error);
    sendError(res, 'Failed to get students', 500);
  }
}

export async function getStudentById(req: Request, res: Response): Promise<void> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, middleName: true, phone: true } },
        group: { include: { department: true } },
        favorites: { include: { subject: true } },
      },
    });

    if (!student) {
      sendError(res, 'Student not found', 404);
      return;
    }

    sendSuccess(res, student);
  } catch (error) {
    console.error('Get student error:', error);
    sendError(res, 'Failed to get student', 500);
  }
}

export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, middleName, phone, groupId, studentId, enrollYear } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'Student123!', 12);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          middleName,
          phone,
          role: 'STUDENT',
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          studentId,
          groupId,
          enrollYear: enrollYear || new Date().getFullYear(),
        },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          group: true,
        },
      });
    });

    sendSuccess(res, student, 'Student created', 201);
  } catch (error) {
    console.error('Create student error:', error);
    sendError(res, 'Failed to create student', 500);
  }
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, phone, email, groupId } = req.body;

    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } });
    if (!student) {
      sendError(res, 'Student not found', 404);
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (firstName || lastName || middleName || phone || email) {
        await tx.user.update({
          where: { id: student.userId },
          data: { firstName, lastName, middleName, phone, email },
        });
      }

      return tx.student.update({
        where: { id },
        data: { groupId },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          group: true,
        },
      });
    });

    sendSuccess(res, result, 'Student updated');
  } catch (error) {
    console.error('Update student error:', error);
    sendError(res, 'Failed to update student', 500);
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) {
      sendError(res, 'Student not found', 404);
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.student.delete({ where: { id: req.params.id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    sendSuccess(res, null, 'Student deleted');
  } catch (error) {
    console.error('Delete student error:', error);
    sendError(res, 'Failed to delete student', 500);
  }
}

export async function toggleFavoriteSubject(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, subjectId } = req.params;

    const existing = await prisma.favoriteSubject.findUnique({
      where: { studentId_subjectId: { studentId, subjectId } },
    });

    if (existing) {
      await prisma.favoriteSubject.delete({ where: { id: existing.id } });
      sendSuccess(res, null, 'Subject removed from favorites');
    } else {
      await prisma.favoriteSubject.create({ data: { studentId, subjectId } });
      sendSuccess(res, null, 'Subject added to favorites');
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    sendError(res, 'Failed to toggle favorite', 500);
  }
}
