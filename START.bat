@echo off
chcp 65001 >nul
title SFEK College - Запуск проекта

echo ============================================
echo   SFEK College - Система управления расписанием
echo   Запуск проекта
echo ============================================
echo.

:: Проверка Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Docker не установлен!
    echo Скачайте Docker Desktop: https://docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

:: Проверка Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте Node.js 18+: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/5] Запуск PostgreSQL через Docker...
docker rm -f sfek-postgres 2>nul
docker run -d --name sfek-postgres -e POSTGRES_USER=sfek_user -e POSTGRES_PASSWORD=sfek_password -e POSTGRES_DB=sfek_schedule -p 5432:5432 postgres:15-alpine
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось запустить PostgreSQL. Убедитесь что Docker Desktop запущен.
    pause
    exit /b 1
)

echo Ожидание запуска PostgreSQL...
timeout /t 5 /nobreak >nul

echo [2/5] Установка зависимостей backend...
cd backend
if not exist node_modules (
    call npm install
)

echo [3/5] Настройка базы данных...
:: Создание .env если нет
if not exist .env (
    copy .env.example .env >nul
    powershell -Command "(Get-Content .env) -replace 'postgresql://postgres:postgres@localhost', 'postgresql://sfek_user:sfek_password@localhost' | Set-Content .env"
)
call npx prisma migrate deploy
call npx tsx prisma/seed.ts

echo [4/5] Установка зависимостей frontend...
cd ..\frontend
if not exist node_modules (
    call npm install
)

echo [5/5] Запуск серверов...
echo.
echo ============================================
echo   Проект запускается!
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo   Демо-аккаунты:
echo   Админ:    admin@sfek.edu.kz / Password123!
echo   Учитель:  petrov@sfek.edu.kz / Password123!
echo   Студент:  student1@sfek.edu.kz / Password123!
echo.
echo   Нажмите Ctrl+C чтобы остановить
echo ============================================

:: Запуск backend в фоне
cd ..\backend
start "SFEK Backend" cmd /c "npm run dev"

:: Запуск frontend
cd ..\frontend
start "SFEK Frontend" cmd /c "npm run dev"

:: Открыть браузер через 3 секунды
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Проект запущен! Браузер откроется автоматически.
echo Не закрывайте это окно пока работаете с проектом.
echo.
pause
