import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalGroups,
      totalSubjects,
      totalClassrooms,
      totalLessons,
      totalDepartments,
      activeSemester,
    ] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.group.count({ where: { isActive: true } }),
      prisma.subject.count({ where: { isActive: true } }),
      prisma.classroom.count({ where: { isActive: true } }),
      prisma.lesson.count(),
      prisma.department.count({ where: { isActive: true } }),
      prisma.semester.findFirst({ where: { isCurrent: true } }),
    ]);

    const lessonsPerDay = await prisma.lesson.groupBy({
      by: ['dayOfWeek'],
      _count: { id: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    const lessonsPerType = await prisma.lesson.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    const groupsPerDepartment = await prisma.group.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: { isActive: true },
    });

    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    const departmentStats = groupsPerDepartment.map((g) => ({
      department: departments.find((d) => d.id === g.departmentId)?.name || 'Unknown',
      groups: g._count.id,
    }));

    sendSuccess(res, {
      overview: {
        totalStudents,
        totalTeachers,
        totalGroups,
        totalSubjects,
        totalClassrooms,
        totalLessons,
        totalDepartments,
      },
      activeSemester,
      charts: {
        lessonsPerDay: lessonsPerDay.map((l) => ({
          day: l.dayOfWeek,
          count: l._count.id,
        })),
        lessonsPerType: lessonsPerType.map((l) => ({
          type: l.type,
          count: l._count.id,
        })),
        departmentStats,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    sendError(res, 'Failed to get stats', 500);
  }
}

export async function getTeacherStats(req: Request, res: Response): Promise<void> {
  try {
    const { teacherId } = req.params;

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        lessons: {
          include: { subject: true, group: true, classroom: true },
        },
        subjects: { include: { subject: true } },
      },
    });

    if (!teacher) {
      sendError(res, 'Teacher not found', 404);
      return;
    }

    const lessonsPerDay = teacher.lessons.reduce<Record<string, number>>((acc, l) => {
      acc[l.dayOfWeek] = (acc[l.dayOfWeek] || 0) + 1;
      return acc;
    }, {});

    sendSuccess(res, {
      teacher: {
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        totalLessons: teacher.lessons.length,
        totalSubjects: teacher.subjects.length,
      },
      lessonsPerDay,
      lessons: teacher.lessons,
    });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    sendError(res, 'Failed to get teacher stats', 500);
  }
}
