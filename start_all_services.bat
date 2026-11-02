@echo off
chcp 65001 >nul
title JobViet - Trinh khoi dong he thong
cd /d "%~dp0"

echo ========================================================
echo        KHOI DONG TOAN BO HE THONG JOBVIET
echo ========================================================
echo.
echo [*] Luu y: Hay chac chan MySQL (XAMPP / MySQL Service) da duoc bat!
echo.

echo [1/4] Dang khoi dong Python ML Service (Port 8000)...
start "1. Python ML Service (Port 8000)" /D "%~dp0ml-service" cmd /k "python main.py"

echo [2/4] Dang khoi dong Socket.io Service (Port 5000)...
start "2. Socket Service (Port 5000)" /D "%~dp0socket-service" cmd /k "node server.js"

echo [3/4] Dang khoi dong Spring Boot Backend (Port 8080)...
start "3. Spring Boot Backend (Port 8080)" /D "%~dp0backend\project" cmd /k "mvnw.cmd spring-boot:run"

echo [4/4] Dang khoi dong Frontend React (Port 5173)...
start "4. Frontend React (Port 5173)" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo   CAC DICH VU DANG DUOC KHOI CHAY TRONG CAC CUA SO RIENG:
echo   - Python ML Service : http://localhost:8000
echo   - Socket.io Service : http://localhost:5000
echo   - Spring Boot API   : http://localhost:8080
echo   - Frontend Website  : http://localhost:5173
echo ========================================================
echo.
echo Dang cho khoi tao va tu dong mo trinh duyet...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo [V] Da mo trinh duyet web tai http://localhost:5173!
echo (Luu y: Spring Boot Backend can khoang 10-15 giay de khoi dong xong, neu trang web chua load du lieu ngay hay F5 lai sau vai giay nhe).
echo.
echo Nhan phim bat ky de thoat cua so nay (cac cua so dich vu van tiep tuc chay)...
pause >nul
