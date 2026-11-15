@echo off
title SmartHire Platform - Continuous Control Terminal
color 0B
mode con: cols=105 lines=34

echo ==============================================================================
echo                      SMARTHIRE PLATFORM - CONTROL TERMINAL                  
echo             Intelligent Two-Way Employment Matching Desktop Service
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/4] Detecting Node.js runtime environment...

set "NODE_EXE="

:: Check system PATH
where node.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "NODE_EXE=node"
    goto :node_found
)

:: Check Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto :node_found
)

:node_found
if "%NODE_EXE%"=="" (
    echo [ERROR] Node.js was not detected on this system!
    echo Please install Node.js from https://nodejs.org or contact support.
    pause
    exit /b 1
)

if not defined JWT_SECRET (
    echo A private JWT signing secret is required.
    set /p "JWT_SECRET=Enter JWT_SECRET: "
)
if not defined JWT_SECRET (
    echo [ERROR] JWT_SECRET is required to start SmartHire.
    pause
    exit /b 1
)

echo [✓] Node.js located: %NODE_EXE%
echo.

:run_loop
echo [2/4] Freeing ports 3001 and 5173 if currently occupied...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo [3/4] Launching SmartHire standalone application window...
echo  - Frontend Web UI:  http://localhost:5173/
echo  - Backend REST API: http://localhost:3001/
echo.

:: Launch app window in background after 3 seconds delay
start /b cmd /c "timeout /t 3 /nobreak >nul && (if exist """C:\Program Files\Google\Chrome\Application\chrome.exe""" (start """""" """C:\Program Files\Google\Chrome\Application\chrome.exe""" --app=http://localhost:5173/ --window-size=1380,880) else if exist """C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe""" (start """""" """C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe""" --app=http://localhost:5173/ --window-size=1380,880) else (start http://localhost:5173/))"

echo [4/4] Starting Continuous Server Supervisor...
echo ------------------------------------------------------------------------------
echo Press Ctrl+C at any time if you wish to restart or stop the services.
echo ------------------------------------------------------------------------------
echo.

:: Run the supervisor
"%NODE_EXE%" server/runner.js

echo.
echo ==============================================================================
echo [WARNING] Supervisor stopped at %TIME%.
echo Restarting in 3 seconds... (Press Ctrl+C to abort)
echo ==============================================================================
timeout /t 3 /nobreak >nul
goto :run_loop
