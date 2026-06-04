import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConflictCheck {
  teacherId: string;
  classroomId: string;
  groupId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  lessonNumber: number;
  excludeLessonId?: string;
}

export interface ScheduleFilter {
  scheduleId?: string;
  teacherId?: string;
  groupId?: string;
  classroomId?: string;
  dayOfWeek?: string;
  semesterId?: string;
}
