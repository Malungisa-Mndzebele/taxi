@echo off
echo.
echo ========================================
echo  Starting Taxi App Locally
echo ========================================
echo.

REM Check if MongoDB is needed
echo [1/3] Checking server dependencies...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install
)

echo.
echo [2/3] Starting backend server...
echo Server will run on: http://localhost:5000
echo.

start "Taxi Backend Server" cmd /k "cd /d %~dp0server && npm start"

timeout /t 3 /nobreak > nul

echo.
echo [3/3] Opening web app...
echo.

REM Open web app in default browser
start "" "%~dp0web\index.html"

echo.
echo ========================================
echo  Taxi App Started Successfully!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Web App: Opened in browser
echo.
echo To stop the server:
echo - Close the "Taxi Backend Server" window
echo - Or press Ctrl+C in that window
echo.
echo ========================================
pause

