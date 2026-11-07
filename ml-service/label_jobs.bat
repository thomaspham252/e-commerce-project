@echo off
chcp 65001 >nul
title JobViet - Gan nhan kiem duyet tin tuyen dung bang PhoBERT AI
cd /d "%~dp0"

echo ================================================================
echo  Chay chuong trinh tu dong kiem duyet va gan nhan tin tuyen dung
echo  Mo hinh PhoBERT trong thu muc phobert_job_moderation
echo ================================================================
echo.

python label_existing_jobs.py

echo.
echo Nhan phim bat ky de thoat...
pause >nul

