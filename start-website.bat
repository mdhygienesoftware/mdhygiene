@echo off
REM ---------------------------------------------------------------
REM  M.D. Hygiene - start the website + admin panel
REM  Double-click this file. Leave the window open while you work.
REM  Closing the window stops the site.
REM ---------------------------------------------------------------
title M.D. Hygiene - website running

cd /d "%~dp0frontend"

echo.
echo   Starting M.D. Hygiene website...
echo.

REM OneDrive turns build files into cloud placeholders, which makes Next.js
REM crash on startup with an EINVAL readlink error. Clearing the build folder
REM first avoids that; it is regenerated automatically.
if exist ".next" (
  echo   Clearing build cache...
  rmdir /s /q ".next" 2>nul
)

REM Install dependencies on first run only.
if not exist "node_modules" (
  echo   First run - installing dependencies. This takes a few minutes...
  call npm install
)

echo.
echo   ============================================
echo     Website:      http://localhost:3000
echo     Admin panel:  http://localhost:3000/admin
echo   ============================================
echo.
echo   Keep this window open. Press Ctrl+C to stop.
echo.

call npm run dev

REM If npm exits (crash or Ctrl+C), hold the window so the error stays readable.
echo.
echo   The server has stopped.
pause
