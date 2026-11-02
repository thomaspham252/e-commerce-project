@echo off
chcp 65001 >nul
echo ========================================================
echo  GAN NHAN CAM XUC CHO TOAN BO REVIEW TRONG DATABASE
echo  Mo hinh PhoBERT trong thu muc company_review_model
echo ========================================================
cd /d "%~dp0"
python label_existing_reviews.py
pause

