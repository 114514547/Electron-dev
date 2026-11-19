@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm >nul 2>nul
if errorlevel 1 goto missing_node
node -e "const [a,b]=process.versions.node.split('.').map(Number);if(a<22||(a===22&&b<12))process.exit(1)"
if errorlevel 1 goto missing_node
if not exist "node_modules\electron\dist\electron.exe" goto missing_deps
call npm run dev
if errorlevel 1 (
  echo.
  echo Startup failed. See the error above.
  pause
)
exit /b
:missing_node
echo Install Node.js 22.12 or newer, including npm, then reopen this file.
pause
exit /b 1
:missing_deps
echo Dependencies are missing. Run npm install in this directory first.
pause
exit /b 1
