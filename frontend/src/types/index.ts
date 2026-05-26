export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
export type LessonType = 'LECTURE' | 'PRACTICE' | 'LAB' | 'SEMINAR' | 'EXAM';
export type SemesterStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type NotificationType = 'SCHEDULE_CHANGE' | 'NEW_SCHEDULE' | 'CANCELLATION' | 'ROOM_CHANGE' | 'GENERAL' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: Role;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  language: string;
  theme: string;
  lastLoginAt?: string;
  createdAt: string;
  teacher?: Teacher;
  student?: Student;
}

export interface Department {
  id: string;
  name: string;
  nameKz?: string;
  nameEn?: string;
  code: string;
  description?: string;
  isActive: boolean;
  _count?: { teachers: number; subjects: number; groups: number };
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  departmentId: string;
  position?: string;
  specialization?: string;
  maxHoursPerWeek: number;
  isActive: boolean;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'middleName' | 'phone' | 'isActive' | 'avatar'>;
  department: Department;
  subjects?: TeacherSubject[];
  _count?: { lessons: number };
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  groupId: string;
  enrollYear: number;
  isActive: boolean;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'middleName' | 'phone' | 'isActive'>;
  group: Group;
  favorites?: FavoriteSubject[];
}

export interface Group {
  id: string;
  name: string;
  departmentId: string;
  course: number;
  maxStudents: number;
  isActive: boolean;
  department?: Department;
  _count?: { students: number; lessons: number };
}

export interface Subject {
  id: string;
  name: string;
  nameKz?: string;
  nameEn?: string;
  code: string;
  departmentId: string;
  description?: string;
  creditHours: number;
  color?: string;
  isActive: boolean;
  department?: Department;
  _count?: { lessons: number; teachers: number };
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  subject: Subject;
}

export interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  equipment: string[];
  isAvailable: boolean;
  isActive: boolean;
  _count?: { lessons: number };
}

export interface Semester {
  id: string;
  name: string;
  nameKz?: string;
  nameEn?: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
  isCurrent: boolean;
  _count?: { schedules: number };
}

export interface Schedule {
  id: string;
  name: string;
  semesterId: string;
  isPublished: boolean;
  isActive: boolean;
  createdBy?: string;
  semester?: Semester;
  lessons?: Lesson[];
  _count?: { lessons: number };
}

export interface Lesson {
  id: string;
  scheduleId: string;
  subjectId: string;
  teacherId: string;
  groupId: string;
  classroomId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  lessonNumber: number;
  type: LessonType;
  isRecurring: boolean;
  specificDate?: string;
  notes?: string;
  subject: Subject;
  teacher: Teacher & { user: Pick<User, 'firstName' | 'lastName'> };
  group: Group;
  classroom: Classroom;
}

export interface Notification {
  id: string;
  userId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  sender?: Pick<User, 'firstName' | 'lastName'>;
}

export interface FavoriteSubject {
  id: string;
  studentId: string;
  subjectId: string;
  subject: Subject;
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

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    totalSubjects: number;
    totalClassrooms: number;
    totalLessons: number;
    totalDepartments: number;
  };
  activeSemester: Semester | null;
  charts: {
    lessonsPerDay: { day: string; count: number }[];
    lessonsPerType: { type: string; count: number }[];
    departmentStats: { department: string; groups: number }[];
  };
}

export interface ConflictResult {
  type: 'teacher' | 'classroom' | 'group';
  message: string;
  conflictingLesson: Record<string, unknown>;
}

export const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const TIME_SLOTS = [
  { num: 1, start: '08:30', end: '09:50' },
  { num: 2, start: '10:00', end: '11:20' },
  { num: 3, start: '11:30', end: '12:50' },
  { num: 4, start: '13:20', end: '14:40' },
  { num: 5, start: '14:50', end: '16:10' },
  { num: 6, start: '16:20', end: '17:40' },
];

export const LESSON_COLORS: Record<LessonType, string> = {
  LECTURE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  PRACTICE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  LAB: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  SEMINAR: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  EXAM: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};
