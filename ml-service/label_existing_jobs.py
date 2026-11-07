"""
Script: label_existing_jobs.py
Mục đích: Kết nối MySQL database, đọc tất cả tin tuyển dụng (đặc biệt là tin chờ duyệt),
gán nhãn kiểm duyệt tự động (an_toan, nghi_van, nguy_co_cao), điểm tin cậy và lý do cảnh báo
bằng mô hình PhoBERT Job Moderation kết hợp Heuristics.
"""

import os
import sys
import logging
from dotenv import load_dotenv
import pymysql
import pymysql.cursors

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("JobLabeler")

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "job_portal_db")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

from job_moderator import moderator

def main():
    print("=" * 75)
    print("🛡️  CHƯƠNG TRÌNH TỰ ĐỘNG GÁN NHÃN & KIỂM DUYỆT TIN TUYỂN DỤNG (PhoBERT)")
    print("=" * 75)

    print("\n📦 Đang nạp mô hình PhoBERT Job Moderation...")
    ok = moderator.load_model()
    if not ok:
        print("❌ Không thể nạp mô hình PhoBERT!")
        sys.exit(1)

    print(f"✅ Mô hình đã sẵn sàng trên thiết bị: {moderator.device.upper()}")

    print(f"\n🔌 Đang kết nối MySQL database '{DB_NAME}' tại {DB_HOST}:{DB_PORT} ...")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USERNAME,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with conn.cursor() as cursor:
            # 1. Kiểm tra và bổ sung cột nếu chưa có trong bảng jobs
            cursor.execute("DESCRIBE jobs")
            existing_cols = [c["Field"] for c in cursor.fetchall()]

            if "moderation_label" not in existing_cols:
                print("⚡ Đang thêm cột 'moderation_label' vào bảng jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_label VARCHAR(50) DEFAULT NULL")
                conn.commit()

            if "moderation_score" not in existing_cols:
                print("⚡ Đang thêm cột 'moderation_score' vào bảng jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_score DOUBLE DEFAULT NULL")
                conn.commit()

            if "moderation_reasons" not in existing_cols:
                print("⚡ Đang thêm cột 'moderation_reasons' vào bảng jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_reasons TEXT DEFAULT NULL")
                conn.commit()

            # 2. Lấy toàn bộ tin tuyển dụng trong bảng jobs
            cursor.execute("""
                SELECT id, title, description, requirements, level, salary_min, salary_max, status
                FROM jobs
                ORDER BY id ASC
            """)
            jobs = cursor.fetchall()
            print(f"📋 Tìm thấy {len(jobs)} tin tuyển dụng trong database.\n")

            counts = {"an_toan": 0, "nghi_van": 0, "nguy_co_cao": 0}

            for idx, j in enumerate(jobs, 1):
                j_id = j["id"]
                title = j.get("title") or ""
                desc = j.get("description") or ""
                req = j.get("requirements") or ""
                lvl = j.get("level") or ""
                s_min = float(j["salary_min"]) if j.get("salary_min") else None
                s_max = float(j["salary_max"]) if j.get("salary_max") else None
                status = j.get("status") or "draft"

                res = moderator.predict(
                    title=title,
                    description=desc,
                    requirements=req,
                    level=lvl,
                    salary_min=s_min,
                    salary_max=s_max
                )

                label = res["label"]
                score = res["score"]
                reasons = res["reasons"]

                counts[label] = counts.get(label, 0) + 1

                # Cập nhật vào DB
                cursor.execute("""
                    UPDATE jobs
                    SET moderation_label = %s,
                        moderation_score = %s,
                        moderation_reasons = %s
                    WHERE id = %s
                """, (label, score, reasons, j_id))

                icon = "🟢" if label == "an_toan" else ("🟡" if label == "nghi_van" else "🔴")
                print(f"[{idx}/{len(jobs)}] Job #{j_id} ({status.upper()}): {icon} [{label.upper()}] ({score * 100:.1f}%) - '{title[:45]}'")
                if label != "an_toan":
                    print(f"    ↳ Lý do: {reasons}")

            conn.commit()

            print("\n" + "=" * 75)
            print("🎉 HOÀN TẤT GÁN NHÃN TOÀN BỘ TIN TUYỂN DỤNG TRONG CSDL!")
            print(f"   🟢 An toàn (an_toan):       {counts.get('an_toan', 0)} tin")
            print(f"   🟡 Nghi vấn (nghi_van):     {counts.get('nghi_van', 0)} tin")
            print(f"   🔴 Nguy cơ cao (nguy_co_cao): {counts.get('nguy_co_cao', 0)} tin")
            print("=" * 75)

    finally:
        conn.close()

if __name__ == "__main__":
    main()

