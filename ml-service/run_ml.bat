@echo off
chcp 65001 >nul
echo ========================================================
echo  KHOI DONG DICH VU ML SERVICE (Port 8000)
echo  Bao gom: Goi y viec lam & Phan loai cam xuc danh gia
echo ========================================================
cd /d "%~dp0"
pip install -r requirements.txt
python main.py
pause

