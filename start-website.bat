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

REM Refuse to start a second copy. Next.js would quietly move to port 3001,
REM leaving you looking at a window that is not the site you opened.
netstat -ano | findstr /r /c:"TCP.*:3000 .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo   The website is already running at http://localhost:3000
  echo   Close that window first if you want to restart it.
  echo.
  pause
  exit /b
)

REM The dev server cannot reuse a .next folder left behind by "npm run build";
REM it fails on startup with an EINVAL readlink error. Clearing it costs a few
REM seconds and the folder is rebuilt automatically.
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
