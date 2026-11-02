"""
Script: label_existing_reviews.py
Mục đích: Kết nối MySQL database, đọc tất cả bình luận từ bảng company_reviews,
gán nhãn cảm xúc (negative, neutral, positive) và điểm tự tin bằng mô hình PhoBERT
đã được huấn luyện trong thư mục company_review_model.
"""

import os
import sys
import logging
from dotenv import load_dotenv
import pymysql
import pymysql.cursors
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Fix Vietnamese printing on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ReviewLabeler")

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "job_portal_db")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "company_review_model")

def main():
    print("=" * 70)
    print("🤖 CHƯƠNG TRÌNH GÁN NHÃN BÌNH LUẬN CÔNG TY BẰNG AI (PhoBERT)")
    print("=" * 70)

    if not os.path.isdir(MODEL_DIR):
        print(f"❌ Không tìm thấy thư mục mô hình tại: {MODEL_DIR}")
        sys.exit(1)

    print(f"📦 Đang tải mô hình từ: {MODEL_DIR} ...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()
    print(f"✅ Mô hình đã sẵn sàng trên thiết bị: {device.upper()}")
    print(f"🏷️  Các nhãn phân loại: {model.config.id2label}")

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
            # 1. Kiểm tra và bổ sung cột nếu chưa có
            cursor.execute("DESCRIBE company_reviews")
            columns = [col["Field"] for col in cursor.fetchall()]

            if "sentiment_label" not in columns:
                print("⚡ Đang thêm cột 'sentiment_label' vào bảng company_reviews...")
                cursor.execute("ALTER TABLE company_reviews ADD COLUMN sentiment_label VARCHAR(50) DEFAULT NULL")
                conn.commit()

            if "sentiment_score" not in columns:
                print("⚡ Đang thêm cột 'sentiment_score' vào bảng company_reviews...")
                cursor.execute("ALTER TABLE company_reviews ADD COLUMN sentiment_score DOUBLE DEFAULT NULL")
                conn.commit()

            # 2. Đọc tất cả bình luận
            cursor.execute("SELECT id, company_id, candidate_id, rating, content FROM company_reviews ORDER BY id ASC")
            reviews = cursor.fetchall()
            print(f"📋 Tìm thấy {len(reviews)} bình luận trong bảng company_reviews.\n")

            label_counts = {"positive": 0, "neutral": 0, "negative": 0}

            for idx, r in enumerate(reviews, 1):
                r_id = r["id"]
                content = (r["content"] or "").strip()
                rating = r["rating"]

                if not content:
                    label = "neutral"
                    confidence = 0.5
                else:
                    inputs = tokenizer(
                        content,
                        return_tensors="pt",
                        truncation=True,
                        max_length=256,
                        padding=True
                    ).to(device)
                    with torch.no_grad():
                        outputs = model(**inputs)
                        probs = torch.softmax(outputs.logits, dim=-1).squeeze().tolist()
                        if isinstance(probs, float):
                            probs = [probs]
                        best_idx = int(np.argmax(probs))
                        label = str(model.config.id2label.get(best_idx, "neutral"))
                        confidence = float(probs[best_idx])

                label_counts[label] = label_counts.get(label, 0) + 1

                # Cập nhật vào DB
                update_sql = """
                    UPDATE company_reviews
                    SET sentiment_label = %s, sentiment_score = %s
                    WHERE id = %s
                """
                cursor.execute(update_sql, (label, round(confidence, 4), r_id))

                icon = "🟢" if label == "positive" else ("🟡" if label == "neutral" else "🔴")
                display_content = content[:70] + "..." if len(content) > 70 else content
                print(f"[{idx:02d}] Review #{r_id} ({rating}★) -> {icon} [{label.upper()} {confidence*100:.1f}%] : \"{display_content}\"")

            conn.commit()
            print("\n" + "=" * 70)
            print("🎉 HOÀN THÀNH GÁN NHÃN CHO TOÀN BỘ BÌNH LUẬN TRONG DATABASE!")
            print(f"📊 Thống kê kết quả: 🟢 Tích cực: {label_counts.get('positive', 0)} | 🟡 Trung tính: {label_counts.get('neutral', 0)} | 🔴 Tiêu cực: {label_counts.get('negative', 0)}")
            print("=" * 70)

    finally:
        conn.close()

if __name__ == "__main__":
    main()

