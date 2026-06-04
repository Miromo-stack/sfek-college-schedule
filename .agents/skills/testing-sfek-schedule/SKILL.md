---
name: testing-sfek-schedule
description: Test the SFEK College Schedule Management System end-to-end. Use when verifying UI, auth, CRUD, theme, language, or role-based access changes.
---

# Testing SFEK College Schedule Management System

## Prerequisites

- Docker (for PostgreSQL)
- Node.js 18+ and npm
- Chrome browser (for GUI testing)

## Devin Secrets Needed

None — the app uses local PostgreSQL with default credentials and JWT secrets from `.env.example`.

## Setup Steps

1. **Start PostgreSQL via Docker:**
   ```bash
   docker run -d --name sfek-pg \
     -e POSTGRES_DB=sfek_schedule \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 postgres:16-alpine
   ```
   Wait for it to be ready: `until docker exec sfek-pg pg_isready -U postgres; do sleep 1; done`

2. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   The default `.env.example` has correct local PostgreSQL connection string.

3. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

4. **Seed demo data:**
   ```bash
   cd backend
   npx tsx prisma/seed.ts
   ```
   This creates demo accounts:
   - Admin: `admin@sfek.edu.kz` / `Password123!`
   - Teacher: `petrov@sfek.edu.kz` / `Password123!`
   - Student: `student1@sfek.edu.kz` / `Password123!`
   
   Plus 8 teachers, 8 students, 6 groups, 10 subjects, 8 classrooms, 25 lessons, 4 departments.

5. **Start backend** (port 3001):
   ```bash
   cd backend && npm run dev
   ```

6. **Start frontend** (port 5173):
   ```bash
   cd frontend && npm run dev
   ```

7. **Verify:** `curl http://localhost:3001/api/health` should return `{"status":"ok"}`

## Key Test Flows

### Login
- Navigate to `http://localhost:5173` — redirects to `/login`
- Click demo account buttons (Admin/Teacher/Student) to fill credentials
- Click "Войти" / "Кіру" / "Login" button (depends on current language)
- Should redirect to `/dashboard`

### Admin Dashboard
- Shows stat cards: Students (8), Teachers (8), Groups (6), Subjects (10), Classrooms (8), Lessons (25), Departments (4)
- Bar chart: lessons per day (Mon-Sat)
- Pie chart: lesson types (Lectures, Lab, Practice)
- Quick action buttons: Create Schedule, Add Teachers, Add Students, Export PDF

### Schedule Timetable
- Week view: 6 day columns (Mon-Sat), 6 time slot rows
- Day view: single column with day picker dropdown
- Group filter dropdown
- Schedule selector dropdown
- Lesson cards show: subject name, teacher initial, classroom number, group, lesson type

### Admin Navigation (11 items)
Dashboard, Schedule, Teachers, Students, Subjects, Classrooms, Groups, Departments, Semesters, Notifications, Settings

### Non-Admin Navigation (4 items)
Dashboard, Schedule, Notifications, Settings

### Theme Toggle
- Moon icon in header → click → dark mode (dark bg, light text, Sun icon)
- Sun icon → click → light mode restored

### Language Switching
- Globe icon in header → dropdown with 3 options:
  - 🇰🇿 Қазақша (Kazakh)
  - 🇷🇺 Русский (Russian)
  - 🇬🇧 English
- Changes all sidebar labels, button text, search placeholders, header greeting

### CRUD Modals
- Each admin page (Teachers, Students, Subjects, etc.) has a "+ Add" button
- Opens a modal with form fields relevant to the entity
- Edit (pencil icon) and Delete (trash icon) buttons on each card

## Tips & Gotchas

- The login page has demo account buttons at the bottom — these fill both email and password fields. You don't need to type credentials manually.
- Language persists across page navigation (stored in localStorage). If the UI appears in an unexpected language, check which was last selected.
- The theme also persists in localStorage.
- The app title changes with language: "SFEK College" (EN), "SFEK Колледж" (KZ/RU).
- Department names and teacher names in the seed data are in Russian regardless of UI language (they're database values, not translated).
- The seed script might fail if run twice (unique constraint violations). Reset the database first: `npx prisma migrate reset --force` then re-seed.
- Backend uses `tsx watch` for development — it auto-restarts on file changes.
- Frontend uses Vite dev server with HMR.
- No CI is configured on this repo — testing is purely local.
