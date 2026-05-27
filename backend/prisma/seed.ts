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

  // Create departments (real SFEK departments)
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Бухгалтерский учет и аудит',
        nameKz: 'Бухгалтерлік есеп және аудит',
        nameEn: 'Accounting and Audit',
        code: 'EA',
        description: 'Экономика және бухгалтерлік есеп мамандығы',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Информационные технологии',
        nameKz: 'Ақпараттық технологиялар',
        nameEn: 'Information Technology',
        code: 'IT',
        description: 'Вычислительная техника и программное обеспечение',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Финансы и страхование',
        nameKz: 'Қаржы және сақтандыру',
        nameEn: 'Finance and Insurance',
        code: 'FIN',
        description: 'Финансово-экономические дисциплины',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Общеобразовательные дисциплины',
        nameKz: 'Жалпы білім беру пәндері',
        nameEn: 'General Education',
        code: 'GEN',
        description: 'Общеобразовательные и гуманитарные дисциплины',
      },
    }),
  ]);

  // Create teacher users and teacher records (real SFEK teachers from schedule)
  const teacherData = [
    { email: 'aitmaganbet@sfek.edu.kz', firstName: 'Айгуль', lastName: 'Айтмаганбетова', empId: 'T001', dept: 0, position: 'Преподаватель', spec: 'Веб-порталы и ИТ' },
    { email: 'konkasheva@sfek.edu.kz', firstName: 'Куляш', lastName: 'Конкашева', empId: 'T002', dept: 0, position: 'Преподаватель', spec: 'Информационные системы' },
    { email: 'alimgozhina@sfek.edu.kz', firstName: 'Мадина', lastName: 'Алимгожина', empId: 'T003', dept: 0, position: 'Преподаватель', spec: 'Бухгалтерский учет' },
    { email: 'kulyzhanova@sfek.edu.kz', firstName: 'Айгуль', lastName: 'Кулыжанова', empId: 'T004', dept: 3, position: 'Преподаватель', spec: 'Репродуктивное здоровье' },
    { email: 'khasenova@sfek.edu.kz', firstName: 'Айнур', lastName: 'Хасенова', empId: 'T005', dept: 0, position: 'Преподаватель', spec: 'Прикладное ПО' },
    { email: 'adilkanova@sfek.edu.kz', firstName: 'Сандугаш', lastName: 'Адилканова', empId: 'T006', dept: 0, position: 'Преподаватель', spec: 'Кассовые аппараты' },
    { email: 'muratova@sfek.edu.kz', firstName: 'Алия', lastName: 'Муратова', empId: 'T007', dept: 0, position: 'Преподаватель', spec: 'Бухгалтерский учет' },
    { email: 'kasenova@sfek.edu.kz', firstName: 'Маржан', lastName: 'Касенова', empId: 'T008', dept: 2, position: 'Преподаватель', spec: 'Финансы и страхование' },
    { email: 'edilnova@sfek.edu.kz', firstName: 'Шолпан', lastName: 'Едилнова', empId: 'T009', dept: 0, position: 'Преподаватель', spec: 'Налоги и платежи' },
    { email: 'kaikienova@sfek.edu.kz', firstName: 'Мадина', lastName: 'Кайкенова', empId: 'T010', dept: 1, position: 'Преподаватель', spec: 'Информационные порталы' },
    { email: 'ismagilova@sfek.edu.kz', firstName: 'Перизат', lastName: 'Исмагилова', empId: 'T011', dept: 1, position: 'Преподаватель', spec: 'Рефакторинг ПО' },
    { email: 'zhuniskanov@sfek.edu.kz', firstName: 'Бауыржан', lastName: 'Жунисканов', empId: 'T012', dept: 1, position: 'Преподаватель', spec: 'Программирование' },
    { email: 'mukusheva@sfek.edu.kz', firstName: 'Лаура', lastName: 'Мукушева', empId: 'T013', dept: 1, position: 'Преподаватель', spec: 'Компьютерная графика' },
    { email: 'esengarinazh@sfek.edu.kz', firstName: 'Жанна', lastName: 'Есенгарина', empId: 'T014', dept: 1, position: 'Преподаватель', spec: 'Мультимедиа и сети' },
    { email: 'basheeva@sfek.edu.kz', firstName: 'Шолпан', lastName: 'Башеева', empId: 'T015', dept: 2, position: 'Преподаватель', spec: 'Предпринимательство' },
    { email: 'turlybekova@sfek.edu.kz', firstName: 'Айгуль', lastName: 'Турлыбекова', empId: 'T016', dept: 2, position: 'Преподаватель', spec: 'Бюджет и налоги' },
    { email: 'topisheva@sfek.edu.kz', firstName: 'Гульнар', lastName: 'Топишева', empId: 'T017', dept: 0, position: 'Преподаватель', spec: 'Налоги и бюджет' },
    { email: 'suleimenova@sfek.edu.kz', firstName: 'Рахима', lastName: 'Сулейменова', empId: 'T018', dept: 2, position: 'Преподаватель', spec: 'Страхование' },
    { email: 'muratkanova@sfek.edu.kz', firstName: 'Айгерим', lastName: 'Муратканова', empId: 'T019', dept: 1, position: 'Преподаватель', spec: 'Сети и серверы' },
    { email: 'amrenova@sfek.edu.kz', firstName: 'Асель', lastName: 'Амренова', empId: 'T020', dept: 1, position: 'Преподаватель', spec: 'Разработка приложений' },
    { email: 'kabdenov@sfek.edu.kz', firstName: 'Мурат', lastName: 'Кабденов', empId: 'T021', dept: 1, position: 'Преподаватель', spec: 'Тестирование ПО' },
    { email: 'seilkhanova@sfek.edu.kz', firstName: 'Айнура', lastName: 'Сейлханова', empId: 'T022', dept: 1, position: 'Преподаватель', spec: 'Визуальные коммуникации' },
    { email: 'bekturganova@sfek.edu.kz', firstName: 'Динара', lastName: 'Бектурганова', empId: 'T023', dept: 1, position: 'Преподаватель', spec: 'Мультимедиа' },
    { email: 'kasenov@sfek.edu.kz', firstName: 'Рустем', lastName: 'Касенов', empId: 'T024', dept: 3, position: 'Преподаватель', spec: 'Физическая культура' },
    { email: 'petrov@sfek.edu.kz', firstName: 'Ахметкали', lastName: 'Ахметкалиева', empId: 'T025', dept: 3, position: 'Преподаватель', spec: 'Иностранный язык' },
    { email: 'isataeva@sfek.edu.kz', firstName: 'Жанар', lastName: 'Исатаева', empId: 'T026', dept: 3, position: 'Преподаватель', spec: 'Русский язык' },
    { email: 'samenova@sfek.edu.kz', firstName: 'Асия', lastName: 'Саменова', empId: 'T027', dept: 3, position: 'Преподаватель', spec: 'Химия' },
    { email: 'medatov@sfek.edu.kz', firstName: 'Ибрагим', lastName: 'Медатов', empId: 'T028', dept: 1, position: 'Преподаватель', spec: 'Компьютерная графика' },
    { email: 'saparov@sfek.edu.kz', firstName: 'Рустам', lastName: 'Сапаров', empId: 'T029', dept: 3, position: 'Преподаватель', spec: 'Дене тәрбиесі' },
    { email: 'voshakina@sfek.edu.kz', firstName: 'Елена', lastName: 'Вошакина', empId: 'T030', dept: 0, position: 'Преподаватель', spec: 'Бухгалтерский учет' },
    { email: 'igishov@sfek.edu.kz', firstName: 'Ержан', lastName: 'Игишов', empId: 'T031', dept: 2, position: 'Преподаватель', spec: 'Финансовый анализ' },
    { email: 'onuarova@sfek.edu.kz', firstName: 'Индира', lastName: 'Онуарова', empId: 'T032', dept: 2, position: 'Преподаватель', spec: 'Аудит' },
    { email: 'temirkhanova@sfek.edu.kz', firstName: 'Жанна', lastName: 'Темирханова', empId: 'T033', dept: 3, position: 'Преподаватель', spec: 'Дене тәрбиесі' },
    { email: 'dyusenbek@sfek.edu.kz', firstName: 'Айнура', lastName: 'Дюсенбекова', empId: 'T034', dept: 0, position: 'Преподаватель', spec: 'Кассовые машины' },
    { email: 'mukhasheva@sfek.edu.kz', firstName: 'Алтынай', lastName: 'Мухатова', empId: 'T035', dept: 2, position: 'Преподаватель', spec: 'Правовое регулирование' },
    { email: 'zhaksenova@sfek.edu.kz', firstName: 'Бибигуль', lastName: 'Жакенова', empId: 'T036', dept: 0, position: 'Преподаватель', spec: 'Классный час' },
    { email: 'keneskaliiev@sfek.edu.kz', firstName: 'Ерлан', lastName: 'Кенескалиев', empId: 'T037', dept: 1, position: 'Преподаватель', spec: 'Разработка приложений' },
    { email: 'kayirbekova@sfek.edu.kz', firstName: 'Гульжан', lastName: 'Кайырбекова', empId: 'T038', dept: 1, position: 'Преподаватель', spec: 'ИТ системы' },
    { email: 'musabekova@sfek.edu.kz', firstName: 'Алия', lastName: 'Мусабекова', empId: 'T039', dept: 3, position: 'Преподаватель', spec: 'Психология' },
    { email: 'isakov@sfek.edu.kz', firstName: 'Алмас', lastName: 'Исаков', empId: 'T040', dept: 2, position: 'Преподаватель', spec: 'Предпринимательство' },
  ];

  const teachers: any[] = [];
  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password,
        firstName: t.firstName,
        lastName: t.lastName,
        role: 'TEACHER',
        language: 'kk',
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

  // Create groups (real SFEK groups from schedule)
  // 1st shift groups (8:00-13:25)
  // 2nd shift groups (13:40-18:50)
  const groups = await Promise.all([
    // EA groups - Бухгалтерский учет (1st shift)
    prisma.group.create({ data: { name: '24 ЕА-1', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),  // 0
    prisma.group.create({ data: { name: '24 ЕА-2', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),  // 1
    prisma.group.create({ data: { name: '24 ЕА-3', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),  // 2
    prisma.group.create({ data: { name: '24 ЕА-4', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),  // 3
    prisma.group.create({ data: { name: '24 ЕА-5', departmentId: departments[0].id, course: 2, maxStudents: 25 } }),  // 4
    prisma.group.create({ data: { name: '25 ЕА-ХІ', departmentId: departments[0].id, course: 1, maxStudents: 25 } }), // 5
    // IT groups - ВО (Вычислительная техника) (1st shift)
    prisma.group.create({ data: { name: '22 ВО-1', departmentId: departments[1].id, course: 4, maxStudents: 25 } }),  // 6
    prisma.group.create({ data: { name: '22 ВО-2', departmentId: departments[1].id, course: 4, maxStudents: 25 } }),  // 7
    prisma.group.create({ data: { name: '22 ВО-3', departmentId: departments[1].id, course: 4, maxStudents: 25 } }),  // 8
    // АЖ groups (1st shift)
    prisma.group.create({ data: { name: '22 АЖ-1', departmentId: departments[1].id, course: 4, maxStudents: 25 } }),  // 9
    prisma.group.create({ data: { name: '22 АЖ-2', departmentId: departments[1].id, course: 4, maxStudents: 25 } }),  // 10
    // ТБ group (1st shift)
    prisma.group.create({ data: { name: '25 ТБ-ХІ', departmentId: departments[2].id, course: 1, maxStudents: 25 } }), // 11
    // 2nd shift groups
    prisma.group.create({ data: { name: '24 ВО-1', departmentId: departments[1].id, course: 2, maxStudents: 25 } }),   // 12
    prisma.group.create({ data: { name: '24 ВО-2', departmentId: departments[1].id, course: 2, maxStudents: 25 } }),   // 13
    prisma.group.create({ data: { name: '24 МС', departmentId: departments[2].id, course: 2, maxStudents: 25 } }),     // 14
    prisma.group.create({ data: { name: '24 БС-1', departmentId: departments[2].id, course: 2, maxStudents: 25 } }),   // 15
    prisma.group.create({ data: { name: '24 БС-2', departmentId: departments[2].id, course: 2, maxStudents: 25 } }),   // 16
    prisma.group.create({ data: { name: '24 ЕА-ХІ', departmentId: departments[0].id, course: 2, maxStudents: 25 } }), // 17
    prisma.group.create({ data: { name: '23 ЕА-1', departmentId: departments[0].id, course: 3, maxStudents: 25 } }),   // 18
    prisma.group.create({ data: { name: '23 ЕА-2', departmentId: departments[0].id, course: 3, maxStudents: 25 } }),   // 19
  ]);

  // Create students
  const studentData = [
    { email: 'student1@sfek.edu.kz', firstName: 'Бекжан', lastName: 'Акылбеков', sid: 'S2024001', group: 0 },
    { email: 'student2@sfek.edu.kz', firstName: 'Камила', lastName: 'Нуртаева', sid: 'S2024002', group: 0 },
    { email: 'student3@sfek.edu.kz', firstName: 'Бахыт', lastName: 'Сериков', sid: 'S2024003', group: 1 },
    { email: 'student4@sfek.edu.kz', firstName: 'Дана', lastName: 'Алимова', sid: 'S2024004', group: 2 },
    { email: 'student5@sfek.edu.kz', firstName: 'Ерболат', lastName: 'Жанузаков', sid: 'S2024005', group: 6 },
    { email: 'student6@sfek.edu.kz', firstName: 'Фариза', lastName: 'Оспанова', sid: 'S2024006', group: 9 },
    { email: 'student7@sfek.edu.kz', firstName: 'Галым', lastName: 'Токаев', sid: 'S2024007', group: 12 },
    { email: 'student8@sfek.edu.kz', firstName: 'Хадиша', lastName: 'Бейсенова', sid: 'S2024008', group: 14 },
  ];

  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password,
        firstName: s.firstName,
        lastName: s.lastName,
        role: 'STUDENT',
        language: 'kk',
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

  // Create subjects (real SFEK subjects from schedule)
  const subjects = await Promise.all([
    // Accounting subjects (EA)
    prisma.subject.create({ data: { name: 'Бухгалтерлік есеп бөлімшелері бойынша бухгалтерлік есеп жүргізу', nameKz: 'Бухгалтерлік есеп бөлімшелері бойынша бухгалтерлік есеп жүргізу', nameEn: 'Departmental Accounting', code: 'KM201', departmentId: departments[0].id, creditHours: 4, color: '#3B82F6' } }), // 0
    prisma.subject.create({ data: { name: 'Қолданбалы бағдарламалық қамтамасыз ету арқылы бухгалтерлік есеп жүргізу', nameKz: 'Қолданбалы ПО арқылы бухгалтерлік есеп жүргізу', nameEn: 'Accounting with Applied Software', code: 'KM202', departmentId: departments[0].id, creditHours: 4, color: '#1D4ED8' } }), // 1
    prisma.subject.create({ data: { name: 'Ақпараттық-анықтамалық және интерактивті веб порталдар', nameKz: 'Ақпараттық-анықтамалық веб порталдар', nameEn: 'Information Web Portals', code: 'ZH201', departmentId: departments[0].id, creditHours: 3, color: '#2563EB' } }), // 2
    prisma.subject.create({ data: { name: 'Бақылау кассалық машиналарын қолдану', nameKz: 'Бақылау кассалық машиналарын қолдану', nameEn: 'Cash Register Operation', code: 'PM201', departmentId: departments[0].id, creditHours: 3, color: '#0EA5E9' } }), // 3
    prisma.subject.create({ data: { name: 'Салықтарды және бюджетке төленетін басқа да міндетті төлемдерді есептеу', nameKz: 'Салықтар және бюджетке төлемдер', nameEn: 'Tax and Budget Calculations', code: 'PM202', departmentId: departments[0].id, creditHours: 3, color: '#0284C7' } }), // 4
    prisma.subject.create({ data: { name: 'Бухгалтерлік есеп по участкам учетной работы', nameKz: 'Бухгалтерлік есеп жұмыстар бойынша', nameEn: 'Accounting by Work Sections', code: 'PM203', departmentId: departments[0].id, creditHours: 4, color: '#0369A1' } }), // 5
    prisma.subject.create({ data: { name: 'Бухгалтерский учет с применением прикладных программных обеспечений', nameKz: 'Қолданбалы ПО арқылы бухгалтерлік есеп', nameEn: 'Accounting with Software Applications', code: 'PM204', departmentId: departments[0].id, creditHours: 4, color: '#075985' } }), // 6
    prisma.subject.create({ data: { name: 'Применение контрольно-кассовых аппаратов', nameKz: 'Бақылау-касса аппараттарын қолдану', nameEn: 'Cash Register Application', code: 'PM205', departmentId: departments[0].id, creditHours: 3, color: '#164E63' } }), // 7
    // IT subjects (VO, AZH)
    prisma.subject.create({ data: { name: 'Бағдарламаны рефакторинг және оңтайландыру', nameKz: 'Бағдарламаны рефакторинг және оңтайландыру', nameEn: 'Software Refactoring and Optimization', code: 'PM601', departmentId: departments[1].id, creditHours: 4, color: '#10B981' } }), // 8
    prisma.subject.create({ data: { name: 'Қосымшаларды әзірлеу технологияларын қолдану', nameKz: 'Қосымшалар әзірлеу технологиялары', nameEn: 'Application Development Technologies', code: 'PM602', departmentId: departments[1].id, creditHours: 4, color: '#059669' } }), // 9
    prisma.subject.create({ data: { name: 'Желілік және серверлік жабдықты орнату және конфигурациялау', nameKz: 'Желілік жабдықтар орнату', nameEn: 'Network and Server Setup', code: 'KM601', departmentId: departments[1].id, creditHours: 4, color: '#047857' } }), // 10
    prisma.subject.create({ data: { name: 'Желілік технологияларды қолдану', nameKz: 'Желілік технологиялар', nameEn: 'Network Technologies', code: 'KM602', departmentId: departments[1].id, creditHours: 3, color: '#065F46' } }), // 11
    prisma.subject.create({ data: { name: 'Мультимедийлік технологияларды қолдану', nameKz: 'Мультимедиа технологиялар', nameEn: 'Multimedia Technologies', code: 'KM603', departmentId: departments[1].id, creditHours: 3, color: '#14B8A6' } }), // 12
    prisma.subject.create({ data: { name: 'Кәсіби қызметте компьютерлік геометрия мен графиканы қолдану', nameKz: 'Компьютерлік геометрия мен графика', nameEn: 'Computer Geometry and Graphics', code: 'KM604', departmentId: departments[1].id, creditHours: 3, color: '#0D9488' } }), // 13
    prisma.subject.create({ data: { name: 'Бағдарламалық жасақтаманы тестілеу', nameKz: 'ПО тестілеу', nameEn: 'Software Testing', code: 'PM603', departmentId: departments[1].id, creditHours: 4, color: '#0F766E' } }), // 14
    prisma.subject.create({ data: { name: 'Жүйелік және желілік қауіпсіздікті жүзеге асыру', nameKz: 'Жүйелік қауіпсіздік', nameEn: 'System and Network Security', code: 'PM604', departmentId: departments[1].id, creditHours: 3, color: '#115E59' } }), // 15
    prisma.subject.create({ data: { name: 'Устанавливать и настраивать сетевое и серверное оборудование', nameKz: 'Серверлік жабдықтарды орнату', nameEn: 'Server Equipment Setup', code: 'PM605', departmentId: departments[1].id, creditHours: 4, color: '#134E4A' } }), // 16
    prisma.subject.create({ data: { name: 'Осуществлять системную и сетевую безопасность', nameKz: 'Жүйелік қауіпсіздік', nameEn: 'System and Network Security', code: 'PM606', departmentId: departments[1].id, creditHours: 3, color: '#1E3A5F' } }), // 17
    prisma.subject.create({ data: { name: 'Электрондық және баспа басылымдарының макеттерін әзірлеу', nameKz: 'Электрондық басылымдар макеттері', nameEn: 'Electronic Publication Layout Design', code: 'PM607', departmentId: departments[1].id, creditHours: 3, color: '#6366F1' } }), // 18
    prisma.subject.create({ data: { name: 'Осуществлять работу с инструментальными средствами визуальной коммуникации', nameKz: 'Визуалдық коммуникация құралдары', nameEn: 'Visual Communication Tools', code: 'PM608', departmentId: departments[1].id, creditHours: 4, color: '#4F46E5' } }), // 19
    prisma.subject.create({ data: { name: 'Применять мультимедиа технологии', nameKz: 'Мультимедиа технологияларын қолдану', nameEn: 'Multimedia Technology Application', code: 'PM609', departmentId: departments[1].id, creditHours: 3, color: '#4338CA' } }), // 20
    prisma.subject.create({ data: { name: 'Применять методы и средства рефакторинга и оптимизации программы', nameKz: 'Рефакторинг әдістері', nameEn: 'Refactoring Methods and Tools', code: 'PM610', departmentId: departments[1].id, creditHours: 4, color: '#3730A3' } }), // 21
    // Finance & Insurance subjects
    prisma.subject.create({ data: { name: 'Меемлекеттік ұйымдарда бюджеттік есепті жүргізу', nameKz: 'Мемлекеттік бюджеттік есеп', nameEn: 'Government Budget Accounting', code: 'KM301', departmentId: departments[2].id, creditHours: 3, color: '#F59E0B' } }), // 22
    prisma.subject.create({ data: { name: 'Ұйым қызметінін құқықтық реттелуін жүзеге асыру', nameKz: 'Ұйым құқықтық реттелуі', nameEn: 'Legal Regulation of Organizations', code: 'KM302', departmentId: departments[2].id, creditHours: 3, color: '#D97706' } }), // 23
    prisma.subject.create({ data: { name: 'Бюджеттік сыныптаманы қолдану', nameKz: 'Бюджеттік сыныптама', nameEn: 'Budget Classification Application', code: 'KM303', departmentId: departments[2].id, creditHours: 3, color: '#B45309' } }), // 24
    prisma.subject.create({ data: { name: 'Подготавливать и направлять документы в компетентные органы', nameKz: 'Құзырлы органдарға құжаттар дайындау', nameEn: 'Document Preparation for Authorities', code: 'PM301', departmentId: departments[2].id, creditHours: 3, color: '#92400E' } }), // 25
    prisma.subject.create({ data: { name: 'Устанавливать критерии и степени риска при заключении договоров', nameKz: 'Тәуекел критерийлері', nameEn: 'Risk Assessment for Insurance', code: 'PM302', departmentId: departments[2].id, creditHours: 3, color: '#78350F' } }), // 26
    prisma.subject.create({ data: { name: 'Обеспечивать правильность исчисления страховых взносов', nameKz: 'Сақтандыру жарналарын есептеу', nameEn: 'Insurance Premium Calculation', code: 'PM303', departmentId: departments[2].id, creditHours: 3, color: '#F97316' } }), // 27
    prisma.subject.create({ data: { name: 'Кәсіпорынның шаруашылық қызметін басқару', nameKz: 'Шаруашылық қызметін басқару', nameEn: 'Enterprise Management', code: 'KM304', departmentId: departments[2].id, creditHours: 3, color: '#EA580C' } }), // 28
    prisma.subject.create({ data: { name: 'Корпоративтік табыс салығын есептеу', nameKz: 'Корпоративтік табыс салығы', nameEn: 'Corporate Income Tax', code: 'KM305', departmentId: departments[2].id, creditHours: 3, color: '#C2410C' } }), // 29
    prisma.subject.create({ data: { name: 'Сақтандырылушылармен сақтандыру мерзімі бойы байланыста болу', nameKz: 'Сақтандырушылармен байланыс', nameEn: 'Insurance Client Relations', code: 'PM304', departmentId: departments[2].id, creditHours: 3, color: '#9A3412' } }), // 30
    prisma.subject.create({ data: { name: 'Құзыретті органдарға құжаттар дайындау', nameKz: 'Құжаттар дайындау', nameEn: 'Document Preparation', code: 'KM306', departmentId: departments[2].id, creditHours: 3, color: '#7C2D12' } }), // 31
    prisma.subject.create({ data: { name: 'Экономикалық субъектінің қаржылық жағдайына аудит жүргізу', nameKz: 'Қаржылық аудит', nameEn: 'Financial Audit', code: 'KM307', departmentId: departments[2].id, creditHours: 3, color: '#DC2626' } }), // 32
    prisma.subject.create({ data: { name: 'Мемлекеттік ұйымдарда бюджеттік есепке алуды жургізу', nameKz: 'Бюджеттік есепке алу', nameEn: 'Government Budget Registration', code: 'KM308', departmentId: departments[2].id, creditHours: 3, color: '#B91C1C' } }), // 33
    prisma.subject.create({ data: { name: 'Предпринимательская деятельность в РК', nameKz: 'ҚР кәсіпкерлік қызметі', nameEn: 'Entrepreneurship in Kazakhstan', code: 'ZH301', departmentId: departments[2].id, creditHours: 3, color: '#991B1B' } }), // 34
    // General education subjects
    prisma.subject.create({ data: { name: 'Репродуктивное здоровье', nameKz: 'Репродуктивтік денсаулық', nameEn: 'Reproductive Health', code: 'GEN01', departmentId: departments[3].id, creditHours: 1, color: '#EC4899' } }), // 35
    prisma.subject.create({ data: { name: 'Классный час', nameKz: 'Класс сағаты', nameEn: 'Homeroom Period', code: 'GEN02', departmentId: departments[3].id, creditHours: 1, color: '#A855F7' } }), // 36
    prisma.subject.create({ data: { name: 'Дене тәрбиесі', nameKz: 'Дене тәрбиесі', nameEn: 'Physical Education', code: 'GEN03', departmentId: departments[3].id, creditHours: 2, color: '#22C55E' } }), // 37
    prisma.subject.create({ data: { name: 'Иностранный язык', nameKz: 'Шет тілі', nameEn: 'Foreign Language', code: 'GEN04', departmentId: departments[3].id, creditHours: 2, color: '#EF4444' } }), // 38
    prisma.subject.create({ data: { name: 'Русский язык', nameKz: 'Орыс тілі', nameEn: 'Russian Language', code: 'GEN05', departmentId: departments[3].id, creditHours: 2, color: '#F97316' } }), // 39
    prisma.subject.create({ data: { name: 'Химия', nameKz: 'Химия', nameEn: 'Chemistry', code: 'GEN06', departmentId: departments[3].id, creditHours: 2, color: '#06B6D4' } }), // 40
    prisma.subject.create({ data: { name: 'Школа лидерства', nameKz: 'Көшбасшылық мектебі', nameEn: 'Leadership School', code: 'GEN07', departmentId: departments[3].id, creditHours: 1, color: '#8B5CF6' } }), // 41
    prisma.subject.create({ data: { name: 'Час психолога', nameKz: 'Психолог сағаты', nameEn: 'Psychology Hour', code: 'GEN08', departmentId: departments[3].id, creditHours: 1, color: '#D946EF' } }), // 42
    prisma.subject.create({ data: { name: 'Использовать услуги информационно-справочных порталов', nameKz: 'Ақпараттық порталдар қызметтері', nameEn: 'Information Portal Services', code: 'OOM201', departmentId: departments[0].id, creditHours: 3, color: '#0891B2' } }), // 43
    prisma.subject.create({ data: { name: 'Использовать компьютерную геометрию и графику', nameKz: 'Компьютерлік геометрия мен графика', nameEn: 'Computer Geometry and Graphics', code: 'PM610b', departmentId: departments[1].id, creditHours: 3, color: '#7C3AED' } }), // 44
    prisma.subject.create({ data: { name: 'Владеть основами ИКТ', nameKz: 'АКТ негіздерін меңгеру', nameEn: 'ICT Fundamentals', code: 'OOM301', departmentId: departments[1].id, creditHours: 3, color: '#2DD4BF' } }), // 45
    prisma.subject.create({ data: { name: 'Рассчитывать налоги и обязательные платежи в бюджет', nameKz: 'Салықтар мен бюджетке төлемдер', nameEn: 'Tax and Budget Payment Calculations', code: 'PM206', departmentId: departments[0].id, creditHours: 4, color: '#475569' } }), // 46
  ]);

  // Create classrooms (real SFEK rooms from schedule)
  const classrooms = await Promise.all([
    prisma.classroom.create({ data: { name: '208', building: 'Корпус', floor: 2, capacity: 30, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 0
    prisma.classroom.create({ data: { name: '301', building: 'Корпус', floor: 3, capacity: 30, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 1
    prisma.classroom.create({ data: { name: '302', building: 'Корпус', floor: 3, capacity: 30, type: 'LECTURE', equipment: ['Доска'] } }),                   // 2
    prisma.classroom.create({ data: { name: '303', building: 'Корпус', floor: 3, capacity: 30, type: 'LECTURE', equipment: ['Доска'] } }),                   // 3
    prisma.classroom.create({ data: { name: '501', building: 'Корпус', floor: 5, capacity: 25, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 4
    prisma.classroom.create({ data: { name: '505', building: 'Корпус', floor: 5, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 5
    prisma.classroom.create({ data: { name: '507', building: 'Корпус', floor: 5, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 6
    prisma.classroom.create({ data: { name: '510', building: 'Корпус', floor: 5, capacity: 30, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 7
    prisma.classroom.create({ data: { name: '511', building: 'Корпус', floor: 5, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 8
    prisma.classroom.create({ data: { name: '603', building: 'Корпус', floor: 6, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 9
    prisma.classroom.create({ data: { name: '605', building: 'Корпус', floor: 6, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 10
    prisma.classroom.create({ data: { name: '606', building: 'Корпус', floor: 6, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 11
    prisma.classroom.create({ data: { name: '607', building: 'Корпус', floor: 6, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 12
    prisma.classroom.create({ data: { name: '610', building: 'Корпус', floor: 6, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 13
    prisma.classroom.create({ data: { name: '611', building: 'Корпус', floor: 6, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 14
    prisma.classroom.create({ data: { name: '701', building: 'Корпус', floor: 7, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 15
    prisma.classroom.create({ data: { name: '702', building: 'Корпус', floor: 7, capacity: 25, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 16
    prisma.classroom.create({ data: { name: '703', building: 'Корпус', floor: 7, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 17
    prisma.classroom.create({ data: { name: '706', building: 'Корпус', floor: 7, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 18
    prisma.classroom.create({ data: { name: '710', building: 'Корпус', floor: 7, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 19
    prisma.classroom.create({ data: { name: '801', building: 'Корпус', floor: 8, capacity: 30, type: 'LECTURE', equipment: ['Доска', 'Проектор'] } }),       // 20
    prisma.classroom.create({ data: { name: '802', building: 'Корпус', floor: 8, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 21
    prisma.classroom.create({ data: { name: '803', building: 'Корпус', floor: 8, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 22
    prisma.classroom.create({ data: { name: '805', building: 'Корпус', floor: 8, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Проектор'] } }),      // 23
    prisma.classroom.create({ data: { name: '806', building: 'Корпус', floor: 8, capacity: 25, type: 'LAB', equipment: ['Компьютеры'] } }),                  // 24
    prisma.classroom.create({ data: { name: '809', building: 'Корпус', floor: 8, capacity: 25, type: 'LAB', equipment: ['Компьютеры', 'Мультимедиа'] } }),   // 25
    prisma.classroom.create({ data: { name: '810', building: 'Корпус', floor: 8, capacity: 25, type: 'LECTURE', equipment: ['Доска'] } }),                   // 26
    prisma.classroom.create({ data: { name: 'Спорт зал', building: 'Корпус', floor: 1, capacity: 50, type: 'LECTURE', equipment: ['Спортивное оборудование'] } }),  // 27
    prisma.classroom.create({ data: { name: 'Актовый зал', building: 'Корпус', floor: 1, capacity: 100, type: 'LECTURE', equipment: ['Микрофон', 'Проектор'] } }), // 28
    prisma.classroom.create({ data: { name: 'Музей', building: 'Корпус', floor: 1, capacity: 30, type: 'SEMINAR', equipment: ['Экспозиции'] } }),            // 29
    prisma.classroom.create({ data: { name: 'Библиотека', building: 'Корпус', floor: 2, capacity: 40, type: 'SEMINAR', equipment: ['Книги', 'Компьютеры'] } }), // 30
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

  // Time slots for 2 shifts
  // 1st shift (8:00-13:25) - 4 pairs (Mon-Thu), 3 pairs (Fri)
  const shift1 = [
    { num: 1, start: '08:00', end: '09:20' },
    { num: 2, start: '09:30', end: '10:50' },
    { num: 3, start: '11:00', end: '12:20' },
    { num: 4, start: '12:30', end: '13:25' },
  ];
  // 2nd shift (13:40-18:50) - 4 pairs (Mon-Thu), 3 pairs (Fri)
  const shift2 = [
    { num: 1, start: '13:40', end: '15:00' },
    { num: 2, start: '15:10', end: '16:30' },
    { num: 3, start: '16:40', end: '18:00' },
    { num: 4, start: '18:10', end: '18:50' },
  ];

  // Helper to create lessons efficiently
  const createLesson = (
    day: DayOfWeek,
    slotIdx: number,
    subjectIdx: number,
    teacherIdx: number,
    groupIdx: number,
    roomIdx: number,
    type: LessonType,
    shift: number,
  ) => {
    const slots = shift === 1 ? shift1 : shift2;
    // Shift 2 lessons get numbers 5-8 so they display in their own rows
    const lessonNum = shift === 1 ? slots[slotIdx].num : slots[slotIdx].num + 4;
    return prisma.lesson.create({
      data: {
        scheduleId: schedule.id,
        subjectId: subjects[subjectIdx].id,
        teacherId: teachers[teacherIdx].id,
        groupId: groups[groupIdx].id,
        classroomId: classrooms[roomIdx].id,
        dayOfWeek: day,
        startTime: slots[slotIdx].start,
        endTime: slots[slotIdx].end,
        lessonNumber: lessonNum,
        type,
      },
    });
  };

  // ================================================================
  // MONDAY SCHEDULE (1st shift: 8:00-13:25)
  // ================================================================

  // 24 ЕА-1 (group 0) - Monday 1st shift
  await createLesson(DayOfWeek.MONDAY, 0, 2, 0, 0, 15, LessonType.PRACTICE, 1);   // Веб порталы - Айтмаганбетова - 701
  await createLesson(DayOfWeek.MONDAY, 1, 0, 2, 0, 20, LessonType.LECTURE, 1);     // Бухгалтерлік есеп - Алимгожина - 801
  await createLesson(DayOfWeek.MONDAY, 2, 35, 3, 0, 29, LessonType.SEMINAR, 1);    // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 3, 1, 4, 0, 20, LessonType.PRACTICE, 1);    // Қолданбалы ПО бух - Хасенова - 801

  // 24 ЕА-5 (group 4) - Monday 1st shift
  await createLesson(DayOfWeek.MONDAY, 0, 2, 0, 4, 15, LessonType.PRACTICE, 1);    // Веб порталы - Айтмаганбетова - 701
  await createLesson(DayOfWeek.MONDAY, 1, 0, 2, 4, 20, LessonType.LECTURE, 1);     // Бухгалтерлік есеп - Алимгожина - 801
  await createLesson(DayOfWeek.MONDAY, 2, 35, 3, 4, 29, LessonType.SEMINAR, 1);    // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 3, 1, 4, 4, 20, LessonType.PRACTICE, 1);    // Қолданбалы ПО бух - Хасенова - 801

  // 24 ЕА-2 (group 1) - Monday 1st shift
  await createLesson(DayOfWeek.MONDAY, 0, 3, 5, 1, 19, LessonType.PRACTICE, 1);    // Кассалық машиналар - Адилканова - 710
  await createLesson(DayOfWeek.MONDAY, 1, 0, 6, 1, 9, LessonType.LECTURE, 1);      // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.MONDAY, 2, 35, 3, 1, 29, LessonType.SEMINAR, 1);    // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 3, 1, 7, 1, 15, LessonType.PRACTICE, 1);    // Қолданбалы ПО бух - Касенова - 701

  // 24 ЕА-3 (group 2) - Monday 1st shift
  await createLesson(DayOfWeek.MONDAY, 0, 6, 2, 2, 20, LessonType.PRACTICE, 1);    // Бух учет с ПО - Алимгожина - 801
  await createLesson(DayOfWeek.MONDAY, 1, 46, 16, 2, 12, LessonType.LECTURE, 1);   // Рассчитывать налоги - Топишева - 607
  await createLesson(DayOfWeek.MONDAY, 2, 35, 3, 2, 29, LessonType.SEMINAR, 1);    // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 3, 7, 5, 2, 19, LessonType.PRACTICE, 1);    // Контрольно-кассовые - Адилканова - 710

  // 24 ЕА-4 (group 3) - Monday 1st shift
  await createLesson(DayOfWeek.MONDAY, 0, 46, 8, 3, 14, LessonType.LECTURE, 1);    // Рассчитывать налоги - Едилнова - 611
  await createLesson(DayOfWeek.MONDAY, 1, 5, 7, 3, 19, LessonType.PRACTICE, 1);    // Бух учет по участкам - Касенова - 710
  await createLesson(DayOfWeek.MONDAY, 2, 35, 3, 3, 29, LessonType.SEMINAR, 1);    // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 3, 43, 1, 3, 23, LessonType.PRACTICE, 1);   // Инфо порталы - Конкашева - 805

  // 22 ВО-1 (group 6) - Monday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.MONDAY, 0, 8, 10, 6, 17, LessonType.PRACTICE, 1);   // Рефакторинг - Исмагилова - 703
  await createLesson(DayOfWeek.MONDAY, 1, 8, 10, 6, 17, LessonType.PRACTICE, 1);   // Рефакторинг - Исмагилова - 703
  await createLesson(DayOfWeek.MONDAY, 2, 8, 10, 6, 17, LessonType.PRACTICE, 1);   // Рефакторинг - Исмагилова - 703

  // 22 ВО-2 (group 7) - Monday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.MONDAY, 0, 9, 19, 7, 22, LessonType.PRACTICE, 1);   // Қосымшалар әзірлеу - Амренова - 803
  await createLesson(DayOfWeek.MONDAY, 1, 9, 19, 7, 22, LessonType.PRACTICE, 1);   // Қосымшалар әзірлеу - Амренова - 803
  await createLesson(DayOfWeek.MONDAY, 2, 9, 19, 7, 22, LessonType.PRACTICE, 1);   // Қосымшалар әзірлеу - Амренова - 803

  // 22 АЖ-1 (group 9) - Monday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.MONDAY, 0, 10, 18, 9, 21, LessonType.PRACTICE, 1);  // Желі жабдықтар - Муратканова - 802
  await createLesson(DayOfWeek.MONDAY, 1, 10, 18, 9, 21, LessonType.PRACTICE, 1);  // Желі жабдықтар - Муратканова - 802
  await createLesson(DayOfWeek.MONDAY, 2, 10, 18, 9, 22, LessonType.PRACTICE, 1);  // Желі жабдықтар - Муратканова - 803

  // 22 АЖ-2 (group 10) - Monday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.MONDAY, 0, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборудование - Муратканова - 802
  await createLesson(DayOfWeek.MONDAY, 1, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборудование - Муратканова - 802
  await createLesson(DayOfWeek.MONDAY, 2, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборудование - Муратканова - 802

  // ================================================================
  // MONDAY SCHEDULE (2nd shift: 13:40-18:50)
  // ================================================================

  // 24 ВО-1 (group 12) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 35, 3, 12, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 1, 13, 12, 12, 15, LessonType.PRACTICE, 2); // Комп геометрия - Мукушева - 701
  await createLesson(DayOfWeek.MONDAY, 2, 12, 13, 12, 22, LessonType.PRACTICE, 2); // Мультимедиа - Есенгарина - 803
  await createLesson(DayOfWeek.MONDAY, 3, 34, 14, 12, 8, LessonType.LECTURE, 2);   // Предпринимательство - Башеева - 511

  // 24 ВО-2 (group 13) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 35, 3, 13, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 1, 44, 27, 13, 22, LessonType.PRACTICE, 2); // Комп геометрия - Медатов - 803
  await createLesson(DayOfWeek.MONDAY, 2, 19, 21, 13, 24, LessonType.PRACTICE, 2); // Визуальная коммуникация - Сейлханова - 806
  await createLesson(DayOfWeek.MONDAY, 3, 20, 22, 13, 25, LessonType.PRACTICE, 2); // Мультимедиа - Бектурганова - 809

  // 24 МС (group 14) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 35, 3, 14, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 1, 22, 14, 14, 8, LessonType.LECTURE, 2);   // Бюджеттік есеп - Башеева - 511
  await createLesson(DayOfWeek.MONDAY, 2, 23, 34, 14, 4, LessonType.LECTURE, 2);   // Құқықтық реттелу - Мухатова - 501
  await createLesson(DayOfWeek.MONDAY, 3, 24, 15, 14, 11, LessonType.LECTURE, 2);  // Бюджеттік сыныптама - Турлыбекова - 606

  // 24 БС-1 (group 15) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 35, 3, 15, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 1, 31, 8, 15, 14, LessonType.LECTURE, 2);   // Құжаттар дайындау - Едилнова - 611
  await createLesson(DayOfWeek.MONDAY, 2, 30, 15, 15, 11, LessonType.LECTURE, 2);  // Сақтандыру - Турлыбекова - 606
  await createLesson(DayOfWeek.MONDAY, 3, 37, 28, 15, 27, LessonType.PRACTICE, 2); // Дене тәрбиесі - Сапаров - Спорт зал

  // 24 БС-2 (group 16) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 35, 3, 16, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.MONDAY, 1, 25, 16, 16, 12, LessonType.LECTURE, 2);  // Подготовка документов - Топишева - 607
  await createLesson(DayOfWeek.MONDAY, 2, 26, 17, 16, 12, LessonType.LECTURE, 2);  // Критерии риска - Сулейменова - 607
  await createLesson(DayOfWeek.MONDAY, 3, 27, 17, 16, 12, LessonType.LECTURE, 2);  // Страховые взносы - Сулейменова - 607

  // 24 ЕА-ХІ (group 17) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 33, 31, 17, 10, LessonType.LECTURE, 2);  // Бюджеттік есепке алу - Онуарова - 605
  await createLesson(DayOfWeek.MONDAY, 1, 37, 32, 17, 27, LessonType.PRACTICE, 2); // Дене тәрбиесі - Темирханова - Спорт зал
  await createLesson(DayOfWeek.MONDAY, 2, 32, 31, 17, 10, LessonType.LECTURE, 2);  // Қаржылық аудит - Онуарова - 605

  // 23 ЕА-1 (group 18) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 28, 0, 18, 6, LessonType.LECTURE, 2);    // Шаруашылық басқару - Айтмаганбетова - 507
  await createLesson(DayOfWeek.MONDAY, 1, 29, 15, 18, 11, LessonType.LECTURE, 2);  // Корпоративтік табыс - Турлыбекова - 606

  // 23 ЕА-2 (group 19) - Monday 2nd shift
  await createLesson(DayOfWeek.MONDAY, 0, 28, 30, 19, 8, LessonType.LECTURE, 2);   // Шаруашылық басқару - Игишов - 511
  await createLesson(DayOfWeek.MONDAY, 1, 29, 15, 19, 10, LessonType.LECTURE, 2);  // Корпоративтік табыс - Турлыбекова - 605

  // ================================================================
  // TUESDAY SCHEDULE (1st shift: 8:00-13:25)
  // ================================================================

  // 25 ЕА-ХІ (group 5) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 38, 24, 5, 7, LessonType.LECTURE, 1);   // Иностранный язык - Ахметкалиева - 510
  await createLesson(DayOfWeek.TUESDAY, 1, 42, 38, 5, 28, LessonType.SEMINAR, 1);  // Час психолога - Мусабекова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 39, 25, 5, 16, LessonType.LECTURE, 1);  // Русский язык - Исатаева - 702
  await createLesson(DayOfWeek.TUESDAY, 3, 40, 26, 5, 5, LessonType.LECTURE, 1);   // Химия - Саменова - 505

  // 25 ТБ-ХІ (group 11) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 37, 28, 11, 27, LessonType.PRACTICE, 1); // Дене тәрбиесі - Сапаров - Спорт зал
  await createLesson(DayOfWeek.TUESDAY, 1, 41, 30, 11, 28, LessonType.SEMINAR, 1);  // Школа лидерства - Вошакина - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 36, 30, 11, 0, LessonType.SEMINAR, 1);   // Классный час - Игишов - 208
  await createLesson(DayOfWeek.TUESDAY, 3, 28, 7, 11, 0, LessonType.LECTURE, 1);    // Шаруашылық басқару - Касенова - 208

  // 24 ЕА-1 (group 0) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 2, 1, 0, 23, LessonType.PRACTICE, 1);   // Веб порталы - Конкашева - 805
  await createLesson(DayOfWeek.TUESDAY, 1, 41, 0, 0, 28, LessonType.SEMINAR, 1);   // Школа лидерства - Айтмаганбетова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 4, 12, 0, 17, LessonType.PRACTICE, 1);  // Салықтар - Мукушева - 703
  await createLesson(DayOfWeek.TUESDAY, 3, 1, 4, 0, 20, LessonType.PRACTICE, 1);   // Қолданбалы ПО бух - Хасенова - 801

  // 24 ЕА-5 (group 4) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 2, 1, 4, 23, LessonType.PRACTICE, 1);   // Веб порталы - Конкашева - 805
  await createLesson(DayOfWeek.TUESDAY, 1, 41, 0, 4, 28, LessonType.SEMINAR, 1);   // Школа лидерства - Айтмаганбетова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 4, 12, 4, 17, LessonType.PRACTICE, 1);  // Салықтар - Мукушева - 703
  await createLesson(DayOfWeek.TUESDAY, 3, 1, 4, 4, 20, LessonType.PRACTICE, 1);   // Қолданбалы ПО бух - Хасенова - 801

  // 24 ЕА-2 (group 1) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 0, 6, 1, 9, LessonType.LECTURE, 1);     // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.TUESDAY, 1, 41, 18, 1, 28, LessonType.SEMINAR, 1);  // Школа лидерства - Муратканова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 4, 0, 1, 26, LessonType.LECTURE, 1);    // Салықтар - Айтмаганбетова - 810
  await createLesson(DayOfWeek.TUESDAY, 3, 3, 5, 1, 19, LessonType.PRACTICE, 1);   // Кассалық машиналар - Адилканова - 710

  // 24 ЕА-3 (group 2) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 7, 5, 2, 19, LessonType.PRACTICE, 1);   // Контрольно-кассовые - Адилканова - 710
  await createLesson(DayOfWeek.TUESDAY, 1, 36, 35, 2, 16, LessonType.SEMINAR, 1);  // Классный час - Жакенова - 702
  await createLesson(DayOfWeek.TUESDAY, 2, 6, 2, 2, 22, LessonType.PRACTICE, 1);   // Бух учет с ПО - Алимгожина - 803
  await createLesson(DayOfWeek.TUESDAY, 3, 5, 29, 2, 16, LessonType.PRACTICE, 1);  // Бух учет по участкам - Вошакина - 702

  // 24 ЕА-4 (group 3) - Tuesday 1st shift
  await createLesson(DayOfWeek.TUESDAY, 0, 37, 23, 3, 27, LessonType.PRACTICE, 1); // Физ.культура - Касенов - Спорт зал
  await createLesson(DayOfWeek.TUESDAY, 1, 36, 16, 3, 12, LessonType.SEMINAR, 1);  // Классный час - Топишева - 607
  await createLesson(DayOfWeek.TUESDAY, 2, 46, 8, 3, 14, LessonType.LECTURE, 1);   // Рассчитывать налоги - Едилнова - 611
  await createLesson(DayOfWeek.TUESDAY, 3, 6, 16, 3, 12, LessonType.PRACTICE, 1);  // Бух учет с ПО - Топишева - 607

  // 22 ВО-1 (group 6) - Tuesday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.TUESDAY, 0, 9, 19, 6, 22, LessonType.PRACTICE, 1);  // Қосымшалар әзірлеу - Амренова - 803
  await createLesson(DayOfWeek.TUESDAY, 1, 9, 19, 6, 22, LessonType.PRACTICE, 1);  // Қосымшалар әзірлеу - Амренова - 803
  await createLesson(DayOfWeek.TUESDAY, 2, 9, 19, 6, 22, LessonType.PRACTICE, 1);  // Қосымшалар әзірлеу - Амренова - 803
  await createLesson(DayOfWeek.TUESDAY, 3, 36, 18, 6, 21, LessonType.SEMINAR, 1);  // Классный час - Муратканова - 802

  // 22 АЖ-1 (group 9) - Tuesday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.TUESDAY, 0, 15, 13, 9, 17, LessonType.PRACTICE, 1); // Жүйелік қауіпсіздік - Есенгарина - 703
  await createLesson(DayOfWeek.TUESDAY, 1, 15, 13, 9, 17, LessonType.PRACTICE, 1); // Жүйелік қауіпсіздік - Есенгарина - 703
  await createLesson(DayOfWeek.TUESDAY, 2, 15, 13, 9, 17, LessonType.PRACTICE, 1); // Жүйелік қауіпсіздік - Есенгарина - 703
  await createLesson(DayOfWeek.TUESDAY, 3, 36, 0, 9, 26, LessonType.SEMINAR, 1);   // Классный час - Айтмаганбетова - 810

  // 22 АЖ-2 (group 10) - Tuesday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.TUESDAY, 0, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.TUESDAY, 1, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.TUESDAY, 2, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.TUESDAY, 3, 36, 12, 10, 25, LessonType.SEMINAR, 1);  // Классный час - Мукушева - 809

  // ================================================================
  // TUESDAY SCHEDULE (2nd shift: 13:40-18:50)
  // ================================================================

  // 24 ВО-1 (group 12) - Tuesday 2nd shift
  await createLesson(DayOfWeek.TUESDAY, 0, 41, 38, 12, 28, LessonType.SEMINAR, 2);  // Школа лидерства - Мусабекова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 1, 36, 19, 12, 22, LessonType.SEMINAR, 2);  // Классный час - Амренова - 803
  await createLesson(DayOfWeek.TUESDAY, 2, 13, 12, 12, 17, LessonType.PRACTICE, 2); // Комп геометрия - Мукушева - 703
  await createLesson(DayOfWeek.TUESDAY, 3, 37, 28, 12, 27, LessonType.PRACTICE, 2); // Дене тәрбиесі - Сапаров - Спорт зал

  // 24 ВО-2 (group 13) - Tuesday 2nd shift
  await createLesson(DayOfWeek.TUESDAY, 0, 36, 21, 13, 24, LessonType.SEMINAR, 2);  // Классный час - Сейлханова - 806
  await createLesson(DayOfWeek.TUESDAY, 1, 41, 38, 13, 28, LessonType.SEMINAR, 2);  // Школа лидерства - Мусабекова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 2, 19, 21, 13, 24, LessonType.PRACTICE, 2); // Визуальная коммуникация - Сейлханова - 806
  await createLesson(DayOfWeek.TUESDAY, 3, 20, 22, 13, 25, LessonType.PRACTICE, 2); // Мультимедиа - Бектурганова - 809

  // 24 МС (group 14) - Tuesday 2nd shift
  await createLesson(DayOfWeek.TUESDAY, 0, 42, 38, 14, 28, LessonType.SEMINAR, 2);  // Час психолога - Мусабекова - Актовый зал
  await createLesson(DayOfWeek.TUESDAY, 1, 22, 14, 14, 8, LessonType.LECTURE, 2);   // Бюджеттік есеп - Башеева - 511
  await createLesson(DayOfWeek.TUESDAY, 2, 23, 34, 14, 4, LessonType.LECTURE, 2);   // Құқықтық реттелу - Мухатова - 501
  await createLesson(DayOfWeek.TUESDAY, 3, 24, 15, 14, 5, LessonType.LECTURE, 2);   // Бюджеттік сыныптама - Турлыбекова - 505

  // 24 БС-1 (group 15) - Tuesday 2nd shift
  await createLesson(DayOfWeek.TUESDAY, 0, 35, 3, 15, 29, LessonType.SEMINAR, 2);   // Репродуктивное здоровье - Кулыжанова - Музей
  await createLesson(DayOfWeek.TUESDAY, 1, 31, 33, 15, 14, LessonType.LECTURE, 2);  // Құжаттар дайындау - Дюсенбекова - 611
  await createLesson(DayOfWeek.TUESDAY, 2, 30, 15, 15, 11, LessonType.LECTURE, 2);  // Сақтандыру - Турлыбекова - 606
  await createLesson(DayOfWeek.TUESDAY, 3, 37, 28, 15, 27, LessonType.PRACTICE, 2); // Дене тәрбиесі - Сапаров - Спорт зал

  // ================================================================
  // WEDNESDAY SCHEDULE (1st shift: 8:00-13:25)
  // ================================================================

  // 24 ЕА-1 (group 0) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 2, 0, 0, 15, LessonType.PRACTICE, 1);  // Веб порталы - Айтмаганбетова - 701
  await createLesson(DayOfWeek.WEDNESDAY, 1, 0, 6, 0, 9, LessonType.LECTURE, 1);    // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.WEDNESDAY, 2, 42, 38, 0, 30, LessonType.SEMINAR, 1); // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 3, 1, 4, 0, 15, LessonType.PRACTICE, 1);  // Қолданбалы ПО бух - Хасенова - 701

  // 24 ЕА-5 (group 4) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 2, 0, 4, 15, LessonType.PRACTICE, 1);  // Веб порталы - Айтмаганбетова - 701
  await createLesson(DayOfWeek.WEDNESDAY, 1, 0, 6, 4, 9, LessonType.LECTURE, 1);    // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.WEDNESDAY, 2, 42, 38, 4, 30, LessonType.SEMINAR, 1); // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 3, 1, 4, 4, 15, LessonType.PRACTICE, 1);  // Қолданбалы ПО бух - Хасенова - 701

  // 24 ЕА-2 (group 1) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 0, 6, 1, 9, LessonType.LECTURE, 1);    // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.WEDNESDAY, 1, 1, 7, 1, 15, LessonType.PRACTICE, 1);  // Қолданбалы ПО бух - Касенова - 701
  await createLesson(DayOfWeek.WEDNESDAY, 2, 42, 38, 1, 30, LessonType.SEMINAR, 1); // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 3, 3, 33, 1, 4, LessonType.PRACTICE, 1);  // Кассалық машиналар - Дюсенбекова - 501

  // 24 ЕА-3 (group 2) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 6, 2, 2, 20, LessonType.PRACTICE, 1);  // Бух учет с ПО - Алимгожина - 801
  await createLesson(DayOfWeek.WEDNESDAY, 1, 46, 16, 2, 12, LessonType.LECTURE, 1); // Рассчитывать налоги - Топишева - 607
  await createLesson(DayOfWeek.WEDNESDAY, 2, 35, 3, 2, 30, LessonType.SEMINAR, 1);  // Репродуктивное здоровье - Кулыжанова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 3, 7, 5, 2, 19, LessonType.PRACTICE, 1);  // Контрольно-кассовые - Адилканова - 710

  // 24 ЕА-4 (group 3) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 46, 8, 3, 14, LessonType.LECTURE, 1);  // Рассчитывать налоги - Едилнова - 611
  await createLesson(DayOfWeek.WEDNESDAY, 1, 5, 17, 3, 26, LessonType.PRACTICE, 1); // Бух учет по участкам - Сулейменова - 810
  await createLesson(DayOfWeek.WEDNESDAY, 2, 35, 3, 3, 30, LessonType.SEMINAR, 1);  // Репродуктивное здоровье - Кулыжанова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 3, 43, 1, 3, 23, LessonType.PRACTICE, 1); // Инфо порталы - Конкашева - 805

  // 22 ВО-1 (group 6) - Wednesday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.WEDNESDAY, 0, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.WEDNESDAY, 1, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.WEDNESDAY, 2, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803

  // 22 ВО-2 (group 7) - Wednesday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.WEDNESDAY, 0, 14, 20, 7, 18, LessonType.PRACTICE, 1); // Тестілеу - Кабденов - 706
  await createLesson(DayOfWeek.WEDNESDAY, 1, 14, 20, 7, 18, LessonType.PRACTICE, 1); // Тестілеу - Кабденов - 706
  await createLesson(DayOfWeek.WEDNESDAY, 2, 14, 20, 7, 18, LessonType.PRACTICE, 1); // Тестілеу - Кабденов - 706

  // 22 АЖ-2 (group 10) - Wednesday 1st shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 17, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевая безопасность - Муратканова - 802
  await createLesson(DayOfWeek.WEDNESDAY, 1, 17, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевая безопасность - Муратканова - 802
  await createLesson(DayOfWeek.WEDNESDAY, 2, 17, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевая безопасность - Муратканова - 802

  // ================================================================
  // WEDNESDAY SCHEDULE (2nd shift: 13:40-18:50)
  // ================================================================

  // 24 ВО-1 (group 12) - Wednesday 2nd shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 42, 38, 12, 30, LessonType.SEMINAR, 2); // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 1, 12, 10, 12, 21, LessonType.PRACTICE, 2); // Мультимедиа - Исмагилова - 802
  await createLesson(DayOfWeek.WEDNESDAY, 2, 13, 12, 12, 23, LessonType.PRACTICE, 2); // Комп геометрия - Мукушева - 805
  await createLesson(DayOfWeek.WEDNESDAY, 3, 34, 14, 12, 8, LessonType.LECTURE, 2);   // Предпринимательство - Башеева - 511

  // 24 ВО-2 (group 13) - Wednesday 2nd shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 35, 3, 13, 30, LessonType.SEMINAR, 2);  // Репродуктивное здоровье - Кулыжанова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 1, 44, 27, 13, 20, LessonType.PRACTICE, 2); // Комп геометрия - Медатов - 801
  await createLesson(DayOfWeek.WEDNESDAY, 2, 19, 21, 13, 24, LessonType.PRACTICE, 2); // Визуальная коммуникация - Сейлханова - 806
  await createLesson(DayOfWeek.WEDNESDAY, 3, 20, 12, 13, 25, LessonType.PRACTICE, 2); // Мультимедиа - Мукушева - 809

  // 24 МС (group 14) - Wednesday 2nd shift
  await createLesson(DayOfWeek.WEDNESDAY, 0, 42, 38, 14, 30, LessonType.SEMINAR, 2); // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.WEDNESDAY, 1, 22, 14, 14, 8, LessonType.LECTURE, 2);  // Бюджеттік есеп - Башеева - 511
  await createLesson(DayOfWeek.WEDNESDAY, 2, 23, 34, 14, 4, LessonType.LECTURE, 2);  // Құқықтық реттелу - Мухатова - 501
  await createLesson(DayOfWeek.WEDNESDAY, 3, 24, 33, 14, 5, LessonType.LECTURE, 2);  // Бюджеттік сыныптама - Дюсенбекова - 505

  // ================================================================
  // THURSDAY SCHEDULE (1st shift: 8:00-13:25)
  // ================================================================

  // 25 ЕА-ХІ (group 5) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 5, 17, 5, 16, LessonType.PRACTICE, 1);  // Бух учет по участкам - Сулейменова - 702
  await createLesson(DayOfWeek.THURSDAY, 1, 6, 17, 5, 16, LessonType.PRACTICE, 1);  // Бух учет с ПО - Сулейменова - 702
  await createLesson(DayOfWeek.THURSDAY, 2, 46, 5, 5, 19, LessonType.LECTURE, 1);   // Налоги - Адилканова - 710
  await createLesson(DayOfWeek.THURSDAY, 3, 7, 5, 5, 19, LessonType.PRACTICE, 1);   // Контрольно-кассовые - Адилканова - 710

  // 24 ЕА-1 (group 0) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 2, 0, 0, 15, LessonType.PRACTICE, 1);  // Веб порталы - Айтмаганбетова - 701
  await createLesson(DayOfWeek.THURSDAY, 1, 4, 0, 0, 26, LessonType.LECTURE, 1);   // Салықтар - Айтмаганбетова - 810
  await createLesson(DayOfWeek.THURSDAY, 2, 37, 23, 0, 27, LessonType.PRACTICE, 1); // Дене тәрбиесі - Касенов - Спорт зал
  await createLesson(DayOfWeek.THURSDAY, 3, 0, 6, 0, 9, LessonType.LECTURE, 1);    // Бухгалтерлік есеп - Муратова - 603

  // 24 ЕА-5 (group 4) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 2, 1, 4, 23, LessonType.PRACTICE, 1);  // Веб порталы - Конкашева - 805
  await createLesson(DayOfWeek.THURSDAY, 1, 4, 32, 4, 17, LessonType.LECTURE, 1);  // Салықтар - Темирханова - 703
  await createLesson(DayOfWeek.THURSDAY, 2, 37, 23, 4, 27, LessonType.PRACTICE, 1); // Дене тәрбиесі - Касенов - Спорт зал
  await createLesson(DayOfWeek.THURSDAY, 3, 1, 4, 4, 20, LessonType.PRACTICE, 1);  // Қолданбалы ПО бух - Хасенова - 801

  // 24 ЕА-2 (group 1) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 0, 6, 1, 9, LessonType.LECTURE, 1);    // Бухгалтерлік есеп - Муратова - 603
  await createLesson(DayOfWeek.THURSDAY, 1, 41, 18, 1, 28, LessonType.SEMINAR, 1); // Школа лидерства - Муратканова - Актовый зал
  await createLesson(DayOfWeek.THURSDAY, 2, 4, 12, 1, 17, LessonType.PRACTICE, 1); // Салықтар - Мукушева - 703
  await createLesson(DayOfWeek.THURSDAY, 3, 1, 7, 1, 20, LessonType.PRACTICE, 1);  // Қолданбалы ПО бух - Касенова - 801

  // 24 ЕА-3 (group 2) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 7, 5, 2, 19, LessonType.PRACTICE, 1);  // Контрольно-кассовые - Адилканова - 710
  await createLesson(DayOfWeek.THURSDAY, 1, 36, 35, 2, 16, LessonType.SEMINAR, 1); // Классный час - Жакенова - 702
  await createLesson(DayOfWeek.THURSDAY, 2, 6, 2, 2, 22, LessonType.PRACTICE, 1);  // Бух учет с ПО - Алимгожина - 803
  await createLesson(DayOfWeek.THURSDAY, 3, 5, 29, 2, 16, LessonType.PRACTICE, 1); // Бух учет по участкам - Вошакина - 702

  // 24 ЕА-4 (group 3) - Thursday 1st shift
  await createLesson(DayOfWeek.THURSDAY, 0, 5, 8, 3, 26, LessonType.PRACTICE, 1);  // Бух учет по участкам - Едилнова - 810
  await createLesson(DayOfWeek.THURSDAY, 1, 6, 16, 3, 19, LessonType.PRACTICE, 1); // Бух учет с ПО - Топишева - 710
  await createLesson(DayOfWeek.THURSDAY, 2, 45, 9, 3, 17, LessonType.PRACTICE, 1); // Владеть ИКТ - Кайкенова - 703
  await createLesson(DayOfWeek.THURSDAY, 3, 46, 8, 3, 14, LessonType.LECTURE, 1);  // Рассчитывать налоги - Едилнова - 611

  // 22 ВО-1 (group 6) - Thursday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.THURSDAY, 0, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.THURSDAY, 1, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.THURSDAY, 2, 11, 13, 6, 22, LessonType.PRACTICE, 1); // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.THURSDAY, 3, 36, 19, 6, 21, LessonType.SEMINAR, 1);  // Классный час - Амренова - 802

  // 22 ВО-2 (group 7) - Thursday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.THURSDAY, 0, 8, 20, 7, 13, LessonType.PRACTICE, 1);  // Рефакторинг - Кабденов - 610
  await createLesson(DayOfWeek.THURSDAY, 1, 8, 20, 7, 13, LessonType.PRACTICE, 1);  // Рефакторинг - Кабденов - 610
  await createLesson(DayOfWeek.THURSDAY, 2, 8, 20, 7, 13, LessonType.PRACTICE, 1);  // Рефакторинг - Кабденов - 610
  await createLesson(DayOfWeek.THURSDAY, 3, 36, 19, 7, 22, LessonType.SEMINAR, 1);  // Классный час - Амренова - 803

  // 22 АЖ-2 (group 10) - Thursday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.THURSDAY, 0, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.THURSDAY, 1, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.THURSDAY, 2, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802
  await createLesson(DayOfWeek.THURSDAY, 3, 16, 18, 10, 21, LessonType.PRACTICE, 1); // Сетевое оборуд - Муратканова - 802

  // ================================================================
  // THURSDAY SCHEDULE (2nd shift: 13:40-18:50)
  // ================================================================

  // 24 ВО-1 (group 12) - Thursday 2nd shift
  await createLesson(DayOfWeek.THURSDAY, 0, 34, 14, 12, 8, LessonType.LECTURE, 2);   // Предпринимательство - Башеева - 511
  await createLesson(DayOfWeek.THURSDAY, 1, 13, 12, 12, 22, LessonType.PRACTICE, 2); // Комп геометрия - Мукушева - 803
  await createLesson(DayOfWeek.THURSDAY, 2, 12, 10, 12, 21, LessonType.PRACTICE, 2); // Мультимедиа - Исмагилова - 802
  await createLesson(DayOfWeek.THURSDAY, 3, 18, 19, 12, 22, LessonType.PRACTICE, 2); // Электрондық басылымдар - Амренова - 803

  // 24 ВО-2 (group 13) - Thursday 2nd shift
  await createLesson(DayOfWeek.THURSDAY, 0, 34, 39, 13, 17, LessonType.LECTURE, 2);  // Предпринимательство - Исаков - 703
  await createLesson(DayOfWeek.THURSDAY, 1, 20, 12, 13, 25, LessonType.PRACTICE, 2); // Мультимедиа - Мукушева - 809
  await createLesson(DayOfWeek.THURSDAY, 2, 19, 21, 13, 24, LessonType.PRACTICE, 2); // Визуальная коммуникация - Сейлханова - 806
  await createLesson(DayOfWeek.THURSDAY, 3, 37, 23, 13, 27, LessonType.PRACTICE, 2); // Дене тәрбиесі - Касенов - Спорт зал

  // ================================================================
  // FRIDAY SCHEDULE (1st shift: 8:00-12:20) - 3 pairs only
  // ================================================================

  // 25 ЕА-ХІ (group 5) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 37, 28, 5, 27, LessonType.PRACTICE, 1);  // Дене тәрбиесі - Сапаров - Спорт зал
  await createLesson(DayOfWeek.FRIDAY, 1, 4, 12, 5, 26, LessonType.LECTURE, 1);    // Салықтар - Мукушева - 810
  await createLesson(DayOfWeek.FRIDAY, 2, 2, 37, 5, 15, LessonType.PRACTICE, 1);   // Веб порталы - Кайырбекова - 701

  // 24 ЕА-1 (group 0) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 4, 0, 0, 26, LessonType.LECTURE, 1);     // Салықтар - Айтмаганбетова - 810
  await createLesson(DayOfWeek.FRIDAY, 1, 2, 37, 0, 15, LessonType.PRACTICE, 1);   // Веб порталы - Кайырбекова - 701
  await createLesson(DayOfWeek.FRIDAY, 2, 1, 4, 0, 30, LessonType.PRACTICE, 1);    // Қолданбалы ПО бух - Хасенова - Библиотека

  // 24 ЕА-5 (group 4) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 4, 0, 4, 26, LessonType.LECTURE, 1);     // Салықтар - Айтмаганбетова - 810
  await createLesson(DayOfWeek.FRIDAY, 1, 2, 37, 4, 15, LessonType.PRACTICE, 1);   // Веб порталы - Кайырбекова - 701
  await createLesson(DayOfWeek.FRIDAY, 2, 1, 4, 4, 30, LessonType.PRACTICE, 1);    // Қолданбалы ПО бух - Хасенова - Библиотека

  // 24 ЕА-2 (group 1) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 37, 28, 1, 27, LessonType.PRACTICE, 1);  // Дене тәрбиесі - Сапаров - Спорт зал
  await createLesson(DayOfWeek.FRIDAY, 1, 2, 33, 1, 15, LessonType.PRACTICE, 1);   // Веб порталы - Дюсенбекова - 701
  await createLesson(DayOfWeek.FRIDAY, 2, 0, 6, 1, 9, LessonType.LECTURE, 1);      // Бухгалтерлік есеп - Муратова - 603

  // 24 ЕА-3 (group 2) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 5, 29, 2, 19, LessonType.PRACTICE, 1);   // Бух учет по участкам - Вошакина - 710
  await createLesson(DayOfWeek.FRIDAY, 1, 6, 2, 2, 22, LessonType.PRACTICE, 1);    // Бух учет с ПО - Алимгожина - 803
  await createLesson(DayOfWeek.FRIDAY, 2, 37, 23, 2, 27, LessonType.PRACTICE, 1);  // Дене тәрбиесі - Касенов - Спорт зал

  // 24 ЕА-4 (group 3) - Friday 1st shift
  await createLesson(DayOfWeek.FRIDAY, 0, 5, 8, 3, 26, LessonType.PRACTICE, 1);    // Бух учет по участкам - Едилнова - 810
  await createLesson(DayOfWeek.FRIDAY, 1, 6, 16, 3, 19, LessonType.PRACTICE, 1);   // Бух учет с ПО - Топишева - 710
  await createLesson(DayOfWeek.FRIDAY, 2, 45, 9, 3, 17, LessonType.PRACTICE, 1);   // Владеть ИКТ - Кайкенова - 703

  // 22 ВО-1 (group 6) - Friday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.FRIDAY, 0, 11, 13, 6, 22, LessonType.PRACTICE, 1);  // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.FRIDAY, 1, 11, 13, 6, 22, LessonType.PRACTICE, 1);  // Желілік технологиялар - Есенгарина - 803
  await createLesson(DayOfWeek.FRIDAY, 2, 11, 13, 6, 22, LessonType.PRACTICE, 1);  // Желілік технологиялар - Есенгарина - 803

  // 22 ВО-2 (group 7) - Friday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.FRIDAY, 0, 8, 20, 7, 13, LessonType.PRACTICE, 1);   // Рефакторинг - Кабденов - 610
  await createLesson(DayOfWeek.FRIDAY, 1, 8, 20, 7, 13, LessonType.PRACTICE, 1);   // Рефакторинг - Кабденов - 610
  await createLesson(DayOfWeek.FRIDAY, 2, 8, 20, 7, 13, LessonType.PRACTICE, 1);   // Рефакторинг - Кабденов - 610

  // 22 ВО-3 (group 8) - Friday 1st shift (оқу тәжірибесі)
  await createLesson(DayOfWeek.FRIDAY, 0, 21, 1, 8, 23, LessonType.PRACTICE, 1);   // Рефакторинг - Конкашева - 805
  await createLesson(DayOfWeek.FRIDAY, 1, 21, 1, 8, 23, LessonType.PRACTICE, 1);   // Рефакторинг - Конкашева - 805
  await createLesson(DayOfWeek.FRIDAY, 2, 21, 1, 8, 23, LessonType.PRACTICE, 1);   // Рефакторинг - Конкашева - 805

  // ================================================================
  // FRIDAY SCHEDULE (2nd shift: 13:40-18:00) - 3 pairs only
  // ================================================================

  // 24 ВО-1 (group 12) - Friday 2nd shift
  await createLesson(DayOfWeek.FRIDAY, 0, 34, 14, 12, 8, LessonType.LECTURE, 2);    // Предпринимательство - Башеева - 511
  await createLesson(DayOfWeek.FRIDAY, 1, 13, 12, 12, 22, LessonType.PRACTICE, 2);  // Комп геометрия - Мукушева - 803
  await createLesson(DayOfWeek.FRIDAY, 2, 12, 10, 12, 21, LessonType.PRACTICE, 2);  // Мультимедиа - Исмагилова - 802

  // 24 ВО-2 (group 13) - Friday 2nd shift
  await createLesson(DayOfWeek.FRIDAY, 0, 34, 39, 13, 17, LessonType.LECTURE, 2);   // Предпринимательство - Исаков - 703
  await createLesson(DayOfWeek.FRIDAY, 1, 20, 12, 13, 25, LessonType.PRACTICE, 2);  // Мультимедиа - Мукушева - 809
  await createLesson(DayOfWeek.FRIDAY, 2, 19, 21, 13, 24, LessonType.PRACTICE, 2);  // Визуальная коммуникация - Сейлханова - 806

  // 24 МС (group 14) - Friday 2nd shift
  await createLesson(DayOfWeek.FRIDAY, 0, 42, 38, 14, 30, LessonType.SEMINAR, 2);   // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.FRIDAY, 1, 23, 34, 14, 4, LessonType.LECTURE, 2);    // Құқықтық реттелу - Мухатова - 501
  await createLesson(DayOfWeek.FRIDAY, 2, 37, 28, 14, 27, LessonType.PRACTICE, 2);  // Дене тәрбиесі - Сапаров - Спорт зал

  // 24 БС-1 (group 15) - Friday 2nd shift
  await createLesson(DayOfWeek.FRIDAY, 0, 42, 38, 15, 30, LessonType.SEMINAR, 2);   // Час психолога - Мусабекова - Библиотека
  await createLesson(DayOfWeek.FRIDAY, 1, 31, 33, 15, 4, LessonType.LECTURE, 2);    // Құжаттар дайындау - Дюсенбекова - 501
  await createLesson(DayOfWeek.FRIDAY, 2, 37, 28, 15, 27, LessonType.PRACTICE, 2);  // Дене тәрбиесі - Сапаров - Спорт зал

  // Create some notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'Жүйе орнатылды!',
        message: 'СФЭК колледжінің кесте басқару жүйесі сәтті баптал.',
      },
    }),
  ]);

  // Create teacher-subject assignments (link teachers to their subjects)
  const teacherSubjectPairs = [
    [0, 2], [1, 2], [1, 43], [2, 0], [2, 6], [3, 35], [4, 1], [5, 3], [5, 7],
    [6, 0], [6, 5], [7, 1], [7, 5], [8, 46], [8, 5], [9, 11], [9, 45],
    [10, 8], [10, 12], [11, 8], [12, 4], [12, 13], [13, 11], [13, 15], [13, 14],
    [14, 34], [14, 22], [15, 24], [15, 30], [15, 29], [16, 46], [16, 6],
    [17, 26], [17, 27], [17, 5], [18, 10], [18, 16], [18, 17],
    [19, 9], [19, 18], [20, 14], [20, 8], [21, 19], [22, 20],
    [23, 37], [24, 38], [25, 39], [26, 40], [27, 44], [28, 37],
    [29, 5], [29, 6], [30, 28], [30, 32], [31, 33], [31, 32],
    [32, 37], [33, 3], [33, 24], [34, 23], [35, 36], [36, 41],
    [37, 2], [38, 42], [39, 34],
  ];

  for (const [tIdx, sIdx] of teacherSubjectPairs) {
    try {
      await prisma.teacherSubject.create({
        data: { teacherId: teachers[tIdx].id, subjectId: subjects[sIdx].id },
      });
    } catch {
      // Skip duplicates
    }
  }

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
