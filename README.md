# SFEK College Schedule Management System

Modern, production-ready web application for managing class schedules at SFEK College in Semey, Kazakhstan.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## Features

- **Schedule Management** — Create, edit, and view class schedules with conflict detection
- **Role-based Access** — Admin, Teacher, and Student roles with appropriate permissions
- **Multi-language** — Kazakh (Қазақша), Russian (Русский), English
- **Dark/Light Theme** — System-aware theme with manual toggle
- **Real-time Updates** — WebSocket integration for live schedule changes
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Modern UI** — Glassmorphism, animations, smooth transitions
- **Export** — PDF and Excel schedule exports
- **Conflict Detection** — Smart detection for teacher, classroom, and group conflicts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| State | Zustand |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| Container | Docker + Docker Compose |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd sfek-college-schedule

# Start all services
docker-compose up -d

# Seed the database
docker exec sfek-backend npx tsx prisma/seed.ts

# Open http://localhost in your browser
```

### Option 2: Manual Setup

#### 1. Database

```bash
# Start PostgreSQL (or use Docker)
docker run -d --name sfek-pg -e POSTGRES_DB=sfek_schedule -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

#### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
npm run dev
```

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

#### 4. Open in browser

```
http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sfek.edu.kz | Password123! |
| Teacher | petrov@sfek.edu.kz | Password123! |
| Student | student1@sfek.edu.kz | Password123! |

## Project Structure

```
sfek-college-schedule/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Demo data seeder
│   ├── src/
│   │   ├── config/                # App configuration
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Auth, validation, errors
│   │   ├── routes/                # API route definitions
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Helpers (prisma, response, validators)
│   │   ├── websocket/             # Socket.IO setup
│   │   └── index.ts               # Express server entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, Header, Layout
│   │   │   └── ui/                # Modal, Skeleton, EmptyState, etc.
│   │   ├── pages/
│   │   │   ├── auth/              # Login page
│   │   │   └── admin/             # Dashboard, Schedule, CRUD pages
│   │   ├── store/                 # Zustand stores
│   │   ├── i18n/                  # Translations (kk, ru, en)
│   │   ├── types/                 # Frontend types
│   │   ├── utils/                 # API client, helpers
│   │   ├── styles/                # Tailwind CSS
│   │   ├── App.tsx                # Router setup
│   │   └── main.tsx               # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| PATCH | `/api/auth/profile` | Update profile |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | List schedules |
| GET | `/api/schedules/:id` | Get schedule with lessons |
| POST | `/api/schedules` | Create schedule (Admin) |
| PATCH | `/api/schedules/:id` | Update schedule (Admin) |
| DELETE | `/api/schedules/:id` | Delete schedule (Admin) |
| GET | `/api/schedules/group/:groupId` | Get group schedule |
| GET | `/api/schedules/teacher/:teacherId` | Get teacher schedule |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons` | List/filter lessons |
| POST | `/api/lessons` | Create lesson with conflict check (Admin) |
| PATCH | `/api/lessons/:id` | Update lesson (Admin) |
| DELETE | `/api/lessons/:id` | Delete lesson (Admin) |
| POST | `/api/lessons/check-conflicts` | Check for conflicts |

### Resources (Teachers, Students, Subjects, Classrooms, Groups, Departments, Semesters)
All follow standard REST patterns:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{resource}` | List with pagination/search |
| GET | `/api/{resource}/:id` | Get by ID |
| POST | `/api/{resource}` | Create (Admin) |
| PATCH | `/api/{resource}/:id` | Update (Admin) |
| DELETE | `/api/{resource}/:id` | Delete (Admin) |

### Additional
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/dashboard` | Dashboard statistics (Admin) |
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/read-all` | Mark all read |
| GET | `/api/health` | Health check |

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sfek_schedule?schema=public
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Database Entities

- **Users** — Authentication and profile
- **Departments** — Academic departments
- **Teachers** — Teacher profiles linked to users
- **Students** — Student profiles linked to users
- **Groups** — Student groups
- **Subjects** — Academic subjects with multi-language names
- **Classrooms** — Physical rooms with equipment
- **Semesters** — Academic periods
- **Schedules** — Named schedule containers
- **Lessons** — Individual class sessions with time, room, teacher, group
- **Notifications** — System and user notifications
- **Attendance** — Attendance tracking (placeholder)
- **FavoriteSubjects** — Student subject bookmarks

## License

MIT
