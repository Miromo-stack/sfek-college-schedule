import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  phone: z.string().optional(),
});

export const lessonSchema = z.object({
  scheduleId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  groupId: z.string().uuid(),
  classroomId: z.string().uuid(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  lessonNumber: z.number().int().min(1).max(8),
  type: z.enum(['LECTURE', 'PRACTICE', 'LAB', 'SEMINAR', 'EXAM']).optional(),
  isRecurring: z.boolean().optional(),
  specificDate: z.string().optional(),
  notes: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  nameKz: z.string().optional(),
  nameEn: z.string().optional(),
  code: z.string().min(1, 'Subject code is required'),
  departmentId: z.string().uuid(),
  description: z.string().optional(),
  creditHours: z.number().int().min(1).optional(),
  color: z.string().optional(),
});

export const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.number().int().min(0),
  capacity: z.number().int().min(1),
  type: z.string().optional(),
  equipment: z.array(z.string()).optional(),
});

export const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  departmentId: z.string().uuid(),
  course: z.number().int().min(1).max(6),
  maxStudents: z.number().int().min(1).optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  nameKz: z.string().optional(),
  nameEn: z.string().optional(),
  code: z.string().min(1, 'Department code is required'),
  description: z.string().optional(),
});

export const semesterSchema = z.object({
  name: z.string().min(1, 'Semester name is required'),
  nameKz: z.string().optional(),
  nameEn: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  semesterId: z.string().uuid(),
  isPublished: z.boolean().optional(),
});

export const notificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['SCHEDULE_CHANGE', 'NEW_SCHEDULE', 'CANCELLATION', 'ROOM_CHANGE', 'GENERAL', 'SYSTEM']).optional(),
  title: z.string().min(1),
  message: z.string().min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  language: z.enum(['kk', 'ru', 'en']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});
