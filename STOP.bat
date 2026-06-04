@echo off
chcp 65001 >nul
title SFEK College - Остановка

echo Остановка серверов...

:: Убить процессы Node.js
taskkill /f /fi "WINDOWTITLE eq SFEK Backend" 2>nul
taskkill /f /fi "WINDOWTITLE eq SFEK Frontend" 2>nul

:: Остановить Docker контейнер
docker stop sfek-postgres 2>nul
docker rm sfek-postgres 2>nul

echo.
echo Все серверы остановлены.
pause
