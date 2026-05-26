import { PrismaClient, DayOfWeek, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.attendance.deleteMany();
  await prisma.favoriteSubject.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.group.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password123!', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sfek.edu.kz',
      password,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'ADMIN',
      language: 'ru',
    },
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Информационные технологии',
        nameKz: 'Ақпараттық технологиялар',
        nameEn: 'Information Technology',
        code: 'IT',
        description: 'Кафедра информационных технологий и программирования',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Экономика и бизнес',
        nameKz: 'Экономика және бизнес',
        nameEn: 'Economics and Business',
        code: 'EB',
        description: 'Кафедра экономических дисциплин',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Естественные науки',
        nameKz: 'Жаратылыстану ғылымдары',
        nameEn: 'Natural Sciences',
        code: 'NS',
        description: 'Кафедра естественнонаучных дисциплин',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Гуманитарные науки',
        nameKz: 'Гуманитарлық ғылымдар',
        nameEn: 'Humanities',
        code: 'HUM',
        description: 'Кафедра гуманитарных дисциплин',
      },
    }),
  ]);

  // Create teacher users and teacher records
  const teacherData = [
    { email: 'petrov@sfek.edu.kz', firstName: 'Иван', lastName: 'Петров', empId: 'T001', dept: 0, position: 'Старший преподаватель', spec: 'Программирование' },
    { email: 'sidorova@sfek.edu.kz', firstName: 'Анна', lastName: 'Сидорова', empId: 'T002', dept: 0, position: 'Преподаватель', spec: 'Базы данных' },
    { email: 'kim@sfek.edu.kz', firstName: 'Алексей', lastName: 'Ким', empId: 'T003', dept: 0, position: 'Преподаватель', spec: 'Веб-технологии' },
    { email: 'nurlan@sfek.edu.kz', firstName: 'Нурлан', lastName: 'Ахметов', empId: 'T004', dept: 1, position: 'Доцент', spec: 'Экономика' },
    { email: 'asel@sfek.edu.kz', firstName: 'Асель', lastName: 'Бекова', empId: 'T005', dept: 2, position: 'Преподаватель', spec: 'Математика' },
    { email: 'marat@sfek.edu.kz', firstName: 'Марат', lastName: 'Тулеев', empId: 'T006', dept: 2, position: 'Старший преподаватель', spec: 'Физика' },
    { email: 'dinara@sfek.edu.kz', firstName: 'Динара', lastName: 'Касымова', empId: 'T007', dept: 3, position: 'Преподаватель', spec: 'Языки' },
    { email: 'serik@sfek.edu.kz', firstName: 'Серік', lastName: 'Жұмабаев', empId: 'T008', dept: 3, position: 'Преподаватель', spec: 'История' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password,
        firstName: t.firstName,
        lastName: t.lastName,
        role: 'TEACHER',
        language: 'ru',
      },
    });
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        employeeId: t.empId,
        departmentId: departments[t.dept].id,
        position: t.position,
        specialization: t.spec,
      },
    });
    teachers.push(teacher);
  }

  // Create groups
  const groups = await Promise.all([
    prisma.group.create({ data: { name: 'ИТ-11', departmentId: departments[0].id, course: 1, maxStudents: 25 } }),
    prisma.group.create({ data: { name: 'ИТ-12', departmentId: departments[0].id, course: 1, maxStudents: 25 } }),
    prisma.group.create({ data: { name: 'ИТ-21', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),
    prisma.group.create({ data: { name: 'ЭБ-11', departmentId: departments[1].id, course: 1, maxStudents: 30 } }),
    prisma.group.create({ data: { name: 'ЕН-11', departmentId: departments[2].id, course: 1, maxStudents: 25 } }),
    prisma.group.create({ data: { name: 'ГН-11', departmentId: departments[3].id, course: 1, maxStudents: 30 } }),
  ]);

  // Create students
  const studentData = [
    { email: 'student1@sfek.edu.kz', firstName: 'Айдар', lastName: 'Мусин', sid: 'S2024001', group: 0 },
    { email: 'student2@sfek.edu.kz', firstName: 'Камила', lastName: 'Нуртаева', sid: 'S2024002', group: 0 },
    { email: 'student3@sfek.edu.kz', firstName: 'Бахыт', lastName: 'Сериков', sid: 'S2024003', group: 1 },
    { email: 'student4@sfek.edu.kz', firstName: 'Дана', lastName: 'Алимова', sid: 'S2024004', group: 2 },
    { email: 'student5@sfek.edu.kz', firstName: 'Ерболат', lastName: 'Жанузаков', sid: 'S2024005', group: 3 },
    { email: 'student6@sfek.edu.kz', firstName: 'Фариза', lastName: 'Оспанова', sid: 'S2024006', group: 4 },
    { email: 'student7@sfek.edu.kz', firstName: 'Галым', lastName: 'Токаев', sid: 'S2024007', group: 5 },
    { email: 'student8@sfek.edu.kz', firstName: 'Хадиша', lastName: 'Бейсенова', sid: 'S2024008', group: 0 },
  ];

  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password,
        firstName: s.firstName,
        lastName: s.lastName,
        role: 'STUDENT',
        language: 'ru',
      },
    });
    await prisma.student.create({
      data: {
        userId: user.id,
        studentId: s.sid,
        groupId: groups[s.group].id,
        enrollYear: 2024,
      },
    });
  }

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Программирование на Python', nameKz: 'Python бағдарламалау', nameEn: 'Python Programming', code: 'IT101', departmentId: departments[0].id, creditHours: 4, color: '#3B82F6' } }),
    prisma.subject.create({ data: { name: 'Базы данных', nameKz: 'Деректер қоры', nameEn: 'Databases', code: 'IT102', departmentId: departments[0].id, creditHours: 3, color: '#8B5CF6' } }),
    prisma.subject.create({ data: { name: 'Веб-разработка', nameKz: 'Веб-әзірлеу', nameEn: 'Web Development', code: 'IT103', departmentId: departments[0].id, creditHours: 4, color: '#10B981' } }),
    prisma.subject.create({ data: { name: 'Компьютерные сети', nameKz: 'Компьютерлік желілер', nameEn: 'Computer Networks', code: 'IT104', departmentId: departments[0].id, creditHours: 3, color: '#F59E0B' } }),
    prisma.subject.create({ data: { name: 'Основы экономики', nameKz: 'Экономика негіздері', nameEn: 'Economics Fundamentals', code: 'EB101', departmentId: departments[1].id, creditHours: 3, color: '#EF4444' } }),
    prisma.subject.create({ data: { name: 'Математика', nameKz: 'Математика', nameEn: 'Mathematics', code: 'NS101', departmentId: departments[2].id, creditHours: 4, color: '#06B6D4' } }),
    prisma.subject.create({ data: { name: 'Физика', nameKz: 'Физика', nameEn: 'Physics', code: 'NS102', departmentId: departments[2].id, creditHours: 3, color: '#84CC16' } }),
    prisma.subject.create({ data: { name: 'Казахский язык', nameKz: 'Қазақ тілі', nameEn: 'Kazakh Language', code: 'HUM101', departmentId: departments[3].id, creditHours: 2, color: '#F97316' } }),
    prisma.subject.create({ data: { name: 'Английский язык', nameKz: 'Ағылшын тілі', nameEn: 'English Language', code: 'HUM102', departmentId: departments[3].id, creditHours: 2, color: '#EC4899' } }),
    prisma.subject.create({ data: { name: 'История Казахстана', nameKz: 'Қазақстан тарихы', nameEn: 'History of Kazakhstan', code: 'HUM103', departmentId: departments[3].id, creditHours: 2, color: '#6366F1' } }),
  ]);

  // Create teacher-subject assignments
  await Promise.all([
    prisma.teacherSubject.create({ data: { teacherId: teachers[0].id, subjectId: subjects[0].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[1].id, subjectId: subjects[1].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[2].id, subjectId: subjects[2].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[0].id, subjectId: subjects[3].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[3].id, subjectId: subjects[4].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[4].id, subjectId: subjects[5].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[5].id, subjectId: subjects[6].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[6].id, subjectId: subjects[7].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[6].id, subjectId: subjects[8].id } }),
    prisma.teacherSubject.create({ data: { teacherId: teachers[7].id, subjectId: subjects[9].id } }),
  ]);

  // Create classrooms
  const classrooms = await Promise.all([
    prisma.classroom.create({ data: { name: '101', building: 'Корпус А', floor: 1, capacity: 30, type: 'LECTURE', equipment: ['Проектор', 'Компьютер', 'Доска'] } }),
    prisma.classroom.create({ data: { name: '102', building: 'Корпус А', floor: 1, capacity: 25, type: 'LECTURE', equipment: ['Проектор', 'Доска'] } }),
    prisma.classroom.create({ data: { name: '201', building: 'Корпус А', floor: 2, capacity: 20, type: 'LAB', equipment: ['Компьютеры', 'Проектор', 'Интерактивная доска'] } }),
    prisma.classroom.create({ data: { name: '202', building: 'Корпус А', floor: 2, capacity: 20, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),
    prisma.classroom.create({ data: { name: '301', building: 'Корпус Б', floor: 3, capacity: 40, type: 'LECTURE', equipment: ['Проектор', 'Микрофон', 'Доска'] } }),
    prisma.classroom.create({ data: { name: '302', building: 'Корпус Б', floor: 3, capacity: 35, type: 'LECTURE', equipment: ['Проектор', 'Доска'] } }),
    prisma.classroom.create({ data: { name: '103', building: 'Корпус Б', floor: 1, capacity: 15, type: 'SEMINAR', equipment: ['Доска', 'Телевизор'] } }),
    prisma.classroom.create({ data: { name: '204', building: 'Корпус А', floor: 2, capacity: 25, type: 'LAB', equipment: ['Физическое оборудование', 'Проектор'] } }),
  ]);

  // Create semester
  const semester = await prisma.semester.create({
    data: {
      name: 'Весенний семестр 2025-2026',
      nameKz: '2025-2026 Көктемгі семестр',
      nameEn: 'Spring Semester 2025-2026',
      academicYear: '2025-2026',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-15'),
      status: 'ACTIVE',
      isCurrent: true,
    },
  });

  // Create schedule
  const schedule = await prisma.schedule.create({
    data: {
      name: 'Основное расписание - Весна 2026',
      semesterId: semester.id,
      isPublished: true,
      createdBy: admin.id,
    },
  });

  // Lesson time slots
  const timeSlots = [
    { num: 1, start: '08:30', end: '09:50' },
    { num: 2, start: '10:00', end: '11:20' },
    { num: 3, start: '11:30', end: '12:50' },
    { num: 4, start: '13:20', end: '14:40' },
    { num: 5, start: '14:50', end: '16:10' },
    { num: 6, start: '16:20', end: '17:40' },
  ];

  // Create lessons for ИТ-11
  const it11Lessons = [
    { day: DayOfWeek.MONDAY, slot: 0, subject: 0, teacher: 0, room: 2, type: LessonType.LECTURE },
    { day: DayOfWeek.MONDAY, slot: 1, subject: 5, teacher: 4, room: 0, type: LessonType.LECTURE },
    { day: DayOfWeek.MONDAY, slot: 2, subject: 7, teacher: 6, room: 6, type: LessonType.PRACTICE },
    { day: DayOfWeek.TUESDAY, slot: 0, subject: 1, teacher: 1, room: 3, type: LessonType.LECTURE },
    { day: DayOfWeek.TUESDAY, slot: 1, subject: 0, teacher: 0, room: 2, type: LessonType.LAB },
    { day: DayOfWeek.TUESDAY, slot: 2, subject: 8, teacher: 6, room: 6, type: LessonType.PRACTICE },
    { day: DayOfWeek.WEDNESDAY, slot: 0, subject: 2, teacher: 2, room: 2, type: LessonType.LECTURE },
    { day: DayOfWeek.WEDNESDAY, slot: 1, subject: 6, teacher: 5, room: 7, type: LessonType.LECTURE },
    { day: DayOfWeek.WEDNESDAY, slot: 2, subject: 9, teacher: 7, room: 0, type: LessonType.LECTURE },
    { day: DayOfWeek.THURSDAY, slot: 0, subject: 0, teacher: 0, room: 2, type: LessonType.PRACTICE },
    { day: DayOfWeek.THURSDAY, slot: 1, subject: 1, teacher: 1, room: 3, type: LessonType.LAB },
    { day: DayOfWeek.THURSDAY, slot: 2, subject: 5, teacher: 4, room: 0, type: LessonType.PRACTICE },
    { day: DayOfWeek.FRIDAY, slot: 0, subject: 2, teacher: 2, room: 2, type: LessonType.LAB },
    { day: DayOfWeek.FRIDAY, slot: 1, subject: 3, teacher: 0, room: 0, type: LessonType.LECTURE },
    { day: DayOfWeek.FRIDAY, slot: 2, subject: 6, teacher: 5, room: 7, type: LessonType.LAB },
  ];

  for (const l of it11Lessons) {
    await prisma.lesson.create({
      data: {
        scheduleId: schedule.id,
        subjectId: subjects[l.subject].id,
        teacherId: teachers[l.teacher].id,
        groupId: groups[0].id,
        classroomId: classrooms[l.room].id,
        dayOfWeek: l.day,
        startTime: timeSlots[l.slot].start,
        endTime: timeSlots[l.slot].end,
        lessonNumber: l.slot + 1,
        type: l.type,
      },
    });
  }

  // Create lessons for ИТ-21
  const it21Lessons = [
    { day: DayOfWeek.MONDAY, slot: 2, subject: 2, teacher: 2, room: 3, type: LessonType.LAB },
    { day: DayOfWeek.MONDAY, slot: 3, subject: 3, teacher: 0, room: 1, type: LessonType.LECTURE },
    { day: DayOfWeek.TUESDAY, slot: 2, subject: 0, teacher: 0, room: 0, type: LessonType.LECTURE },
    { day: DayOfWeek.TUESDAY, slot: 3, subject: 1, teacher: 1, room: 1, type: LessonType.LECTURE },
    { day: DayOfWeek.WEDNESDAY, slot: 2, subject: 5, teacher: 4, room: 1, type: LessonType.PRACTICE },
    { day: DayOfWeek.WEDNESDAY, slot: 3, subject: 8, teacher: 6, room: 0, type: LessonType.PRACTICE },
    { day: DayOfWeek.THURSDAY, slot: 2, subject: 2, teacher: 2, room: 3, type: LessonType.PRACTICE },
    { day: DayOfWeek.THURSDAY, slot: 3, subject: 3, teacher: 0, room: 1, type: LessonType.LAB },
    { day: DayOfWeek.FRIDAY, slot: 2, subject: 1, teacher: 1, room: 3, type: LessonType.LAB },
    { day: DayOfWeek.FRIDAY, slot: 3, subject: 9, teacher: 7, room: 5, type: LessonType.LECTURE },
  ];

  for (const l of it21Lessons) {
    await prisma.lesson.create({
      data: {
        scheduleId: schedule.id,
        subjectId: subjects[l.subject].id,
        teacherId: teachers[l.teacher].id,
        groupId: groups[2].id,
        classroomId: classrooms[l.room].id,
        dayOfWeek: l.day,
        startTime: timeSlots[l.slot].start,
        endTime: timeSlots[l.slot].end,
        lessonNumber: l.slot + 1,
        type: l.type,
      },
    });
  }

  // Create some notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Добро пожаловать!',
        message: 'Система управления расписанием SFEK College успешно настроена.',
      },
    }),
  ]);

  console.log('Seed data created successfully!');
  console.log('---');
  console.log('Admin: admin@sfek.edu.kz / Password123!');
  console.log('Teacher: petrov@sfek.edu.kz / Password123!');
  console.log('Student: student1@sfek.edu.kz / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
