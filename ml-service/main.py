import os
import re
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
import pymysql
import pymysql.cursors
import pandas as pd
import numpy as np
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from job_moderator import moderator

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("JobPortalML")

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "job_portal_db")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
PORT = int(os.getenv("PORT", "8000"))

# Path to the fine-tuned review sentiment classification model
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "company_review_model")

# ==============================================================================
# 1. JOB RECOMMENDATION ENGINE STORE & LOGIC
# ==============================================================================

class RecommendationStore:
    jobs_df: pd.DataFrame = pd.DataFrame()
    cosine_sim_matrix: np.ndarray = np.empty((0, 0))
    id_to_idx: Dict[int, int] = {}
    idx_to_id: Dict[int, int] = {}
    is_ready: bool = False

rec_store = RecommendationStore()

def normalize_tech_tokens(text: str) -> str:
    """Preserve technology acronyms that standard tokenizers would split or drop."""
    if not text or not isinstance(text, str):
        return ""
    
    t = text.lower()
    t = re.sub(r'\bc\+\+\b', 'cpp', t)
    t = re.sub(r'\bc#\b', 'csharp', t)
    t = re.sub(r'\basp\.net\b', 'aspdotnet', t)
    t = re.sub(r'\b\.net\b', 'dotnet', t)
    t = re.sub(r'\bnode\.js\b', 'nodejs', t)
    t = re.sub(r'\bvue\.js\b', 'vuejs', t)
    t = re.sub(r'\breact\.js\b', 'reactjs', t)
    t = re.sub(r'\bnext\.js\b', 'nextjs', t)
    t = re.sub(r'\bnuxt\.js\b', 'nuxtjs', t)
    
    t = re.sub(r'[\r\n\t]+', ' ', t)
    t = re.sub(r'[-–—•\*\/:,;(){}\[\]"\'`~_!?]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def parse_skills_list(skills_str: Optional[str]) -> List[str]:
    if not skills_str or not isinstance(skills_str, str):
        return []
    return [s.strip() for s in skills_str.split(',') if s.strip()]

def fetch_jobs_from_db() -> pd.DataFrame:
    """Connect to MySQL and fetch all active OPEN jobs."""
    logger.info("Connecting to MySQL at %s:%d/%s as '%s'...", DB_HOST, DB_PORT, DB_NAME, DB_USERNAME)
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
            sql = """
                SELECT id, title, skills, level, job_type, location, description, requirements
                FROM jobs
                WHERE status = 'OPEN'
                ORDER BY id ASC;
            """
            cursor.execute(sql)
            rows = cursor.fetchall()
            df = pd.DataFrame(rows)
            logger.info("Successfully fetched %d OPEN jobs from MySQL database.", len(df))
            return df
    finally:
        conn.close()

def build_recommendation_matrix():
    """Extract jobs, preprocess features, and build TF-IDF Cosine Similarity Matrix."""
    df = fetch_jobs_from_db()
    if df.empty:
        logger.warning("No OPEN jobs found in database! Recommendation matrix is empty.")
        rec_store.jobs_df = df
        rec_store.cosine_sim_matrix = np.empty((0, 0))
        rec_store.id_to_idx = {}
        rec_store.idx_to_id = {}
        rec_store.is_ready = True
        return 0

    documents = []
    id_to_idx = {}
    idx_to_id = {}

    for idx, row in df.iterrows():
        job_id = int(row["id"])
        id_to_idx[job_id] = idx
        idx_to_id[idx] = job_id

        title_clean = normalize_tech_tokens(row.get("title", ""))
        skills_clean = normalize_tech_tokens(row.get("skills", ""))
        level_clean = normalize_tech_tokens(row.get("level", ""))
        location_clean = normalize_tech_tokens(row.get("location", ""))
        desc_clean = normalize_tech_tokens(row.get("description", ""))
        req_clean = normalize_tech_tokens(row.get("requirements", ""))

        weighted_doc = (
            f" {title_clean}" * 4 +
            f" {skills_clean}" * 4 +
            f" {level_clean}" * 2 +
            f" {location_clean}" * 1 +
            f" {desc_clean}" * 1 +
            f" {req_clean}" * 1
        ).strip()
        documents.append(weighted_doc)

    logger.info("Computing TF-IDF vectors for %d documents...", len(documents))
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.85,
        sublinear_tf=True
    )
    tfidf_matrix = vectorizer.fit_transform(documents)

    logger.info("Computing Cosine Similarity Matrix of shape (%d, %d)...", tfidf_matrix.shape[0], tfidf_matrix.shape[0])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    rec_store.jobs_df = df
    rec_store.cosine_sim_matrix = cosine_sim
    rec_store.id_to_idx = id_to_idx
    rec_store.idx_to_id = idx_to_id
    rec_store.is_ready = True

    logger.info("Job Recommendation Matrix successfully built and cached in memory!")
    return len(df)


# ==============================================================================
# 2. COMPANY REVIEW SENTIMENT CLASSIFICATION MODEL
# ==============================================================================

class SentimentModelStore:
    tokenizer = None
    model = None
    device: str = "cpu"
    is_ready: bool = False

sentiment_store = SentimentModelStore()

def load_sentiment_model() -> bool:
    """Loads fine-tuned PhoBERT review classification model from MODEL_DIR."""
    if not os.path.isdir(MODEL_DIR):
        logger.warning("Sentiment model directory not found at: %s", MODEL_DIR)
        return False

    try:
        logger.info("Loading Vietnamese Sentiment Model from: %s ...", MODEL_DIR)
        sentiment_store.tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        sentiment_store.model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        sentiment_store.device = device
        sentiment_store.model.to(device)
        sentiment_store.model.eval()
        sentiment_store.is_ready = True
        logger.info("Sentiment Model loaded successfully on device: %s! Labels: %s", device, sentiment_store.model.config.id2label)
        return True
    except Exception as e:
        logger.error("Error loading Sentiment Model: %s", str(e), exc_info=True)
        return False

def predict_review_sentiment(text: str) -> Dict[str, Any]:
    """Infers sentiment label ('negative', 'neutral', 'positive') and confidence score."""
    if not sentiment_store.is_ready or sentiment_store.model is None or sentiment_store.tokenizer is None:
        raise RuntimeError("Sentiment model is not initialized.")

    if not text or not text.strip():
        return {
            "label": "neutral",
            "score": 0.5,
            "probabilities": {"negative": 0.25, "neutral": 0.5, "positive": 0.25}
        }

    inputs = sentiment_store.tokenizer(
        text.strip(),
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=True
    ).to(sentiment_store.device)

    with torch.no_grad():
        outputs = sentiment_store.model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1).squeeze().tolist()

    if isinstance(probs, float):
        probs = [probs]

    id2label = sentiment_store.model.config.id2label
    best_idx = int(np.argmax(probs))
    best_label = str(id2label.get(best_idx, id2label.get(str(best_idx), "neutral")))
    confidence = float(probs[best_idx])

    prob_dict = {}
    for idx, p in enumerate(probs):
        lbl = str(id2label.get(idx, id2label.get(str(idx), f"class_{idx}")))
        prob_dict[lbl] = round(float(p), 4)

    return {
        "label": best_label,
        "score": round(confidence, 4),
        "probabilities": prob_dict
    }

def label_all_reviews_in_db() -> Dict[str, Any]:
    """Scans MySQL company_reviews, ensures columns exist, and predicts sentiment for all rows."""
    if not sentiment_store.is_ready:
        loaded = load_sentiment_model()
        if not loaded:
            raise RuntimeError("Sentiment model could not be loaded.")

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
            # 1. Check and add columns if they don't exist
            cursor.execute("DESCRIBE company_reviews")
            existing_cols = [c["Field"] for c in cursor.fetchall()]

            if "sentiment_label" not in existing_cols:
                logger.info("Adding column 'sentiment_label' to company_reviews...")
                cursor.execute("ALTER TABLE company_reviews ADD COLUMN sentiment_label VARCHAR(50) DEFAULT NULL")
                conn.commit()

            if "sentiment_score" not in existing_cols:
                logger.info("Adding column 'sentiment_score' to company_reviews...")
                cursor.execute("ALTER TABLE company_reviews ADD COLUMN sentiment_score DOUBLE DEFAULT NULL")
                conn.commit()

            # 2. Select all reviews
            cursor.execute("SELECT id, content, rating FROM company_reviews ORDER BY id ASC")
            rows = cursor.fetchall()

            updated_items = []
            for r in rows:
                r_id = r["id"]
                content = r["content"] or ""
                pred = predict_review_sentiment(content)

                cursor.execute(
                    "UPDATE company_reviews SET sentiment_label = %s, sentiment_score = %s WHERE id = %s",
                    (pred["label"], pred["score"], r_id)
                )
                updated_items.append({
                    "id": r_id,
                    "rating": r["rating"],
                    "content_snippet": content[:60] + ("..." if len(content) > 60 else ""),
                    "sentiment_label": pred["label"],
                    "sentiment_score": pred["score"]
                })

            conn.commit()
            logger.info("Successfully updated sentiment for %d reviews in MySQL.", len(updated_items))
            return {
                "total_updated": len(updated_items),
                "reviews": updated_items
            }
    finally:
        conn.close()


# ==============================================================================
# 3. FASTAPI APPLICATION SETUP
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Build Recommendation Matrix
    try:
        count = build_recommendation_matrix()
        logger.info("Job Recommender startup complete. Indexed %d jobs.", count)
    except Exception as e:
        logger.error("Failed to build recommendation matrix at startup: %s", str(e), exc_info=True)

    # 2. Load Review Sentiment Model
    try:
        s_ok = load_sentiment_model()
        if s_ok:
            logger.info("Company Review Sentiment Model startup complete.")
        else:
            logger.warning("Company Review Sentiment Model could not be loaded at startup.")
    except Exception as e:
        logger.error("Failed to load sentiment model at startup: %s", str(e), exc_info=True)

    # 3. Load PhoBERT Job Moderation Model
    try:
        m_ok = moderator.load_model()
        if m_ok:
            logger.info("PhoBERT Job Moderation Model startup complete.")
        else:
            logger.warning("PhoBERT Job Moderation Model could not be loaded at startup.")
    except Exception as e:
        logger.error("Failed to load job moderation model at startup: %s", str(e), exc_info=True)

    yield
    logger.info("JobPortal ML Service shutting down.")

app = FastAPI(
    title="JobPortal Machine Learning Service",
    description="Unified ML microservice providing Content-based Job Recommendations & Vietnamese Company Review Sentiment Classification",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class SentimentPredictRequest(BaseModel):
    text: str

class SentimentBatchPredictRequest(BaseModel):
    texts: List[str]


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "job_recommender": {
            "ready": rec_store.is_ready,
            "jobs_indexed": len(rec_store.jobs_df)
        },
        "sentiment_classifier": {
            "ready": sentiment_store.is_ready,
            "device": sentiment_store.device,
            "labels": list(sentiment_store.model.config.id2label.values()) if sentiment_store.is_ready else []
        },
        "job_moderator": {
            "ready": moderator.is_ready,
            "device": moderator.device,
            "labels": list(moderator.model.config.id2label.values()) if moderator.is_ready and moderator.model else []
        }
    }


# --- Job Recommendation Endpoints ---

@app.get("/api/related-jobs/{job_id}")
def get_related_jobs(job_id: int, top_k: int = Query(6, ge=1, le=20)):
    if not rec_store.is_ready or rec_store.jobs_df.empty:
        raise HTTPException(status_code=503, detail="Recommendation engine is still initializing or empty.")

    if job_id not in rec_store.id_to_idx:
        raise HTTPException(status_code=404, detail=f"Job ID {job_id} not found in active index.")

    target_idx = rec_store.id_to_idx[job_id]
    target_row = rec_store.jobs_df.iloc[target_idx]
    target_skills_list = parse_skills_list(target_row.get("skills"))
    target_skills_lower = {s.lower(): s for s in target_skills_list}

    sim_scores = rec_store.cosine_sim_matrix[target_idx]
    indexed_scores = [(idx, score) for idx, score in enumerate(sim_scores) if idx != target_idx]
    indexed_scores.sort(key=lambda x: x[1], reverse=True)

    top_matches = indexed_scores[:top_k]
    results = []

    for idx, score in top_matches:
        candidate_id = rec_store.idx_to_id[idx]
        candidate_row = rec_store.jobs_df.iloc[idx]
        candidate_skills_list = parse_skills_list(candidate_row.get("skills"))

        matched = []
        for cs in candidate_skills_list:
            if cs.lower() in target_skills_lower:
                matched.append(cs)

        raw_score = float(score)
        normalized_ratio = min(1.0, max(0.0, raw_score / 0.25))
        match_pct = int(round(65 + normalized_ratio * 32))

        results.append({
            "job_id": candidate_id,
            "title": str(candidate_row["title"]),
            "similarity_score": round(raw_score, 4),
            "match_percentage": match_pct,
            "matched_skills": matched[:5],
            "location": str(candidate_row.get("location", "")),
            "level": str(candidate_row.get("level", ""))
        })

    return results

@app.post("/api/reindex")
def reindex_jobs():
    try:
        count = build_recommendation_matrix()
        return {
            "status": "SUCCESS",
            "message": f"Successfully reindexed {count} active jobs into recommendation matrix.",
            "total_jobs": count
        }
    except Exception as e:
        logger.error("Error during reindex: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Reindex failed: {str(e)}")


# --- Review Sentiment Classification Endpoints ---

@app.post("/api/sentiment/predict")
def predict_sentiment(req: SentimentPredictRequest):
    if not sentiment_store.is_ready:
        # Try loading on-demand if not loaded yet
        ok = load_sentiment_model()
        if not ok:
            raise HTTPException(status_code=503, detail="Sentiment model is not ready.")

    try:
        return predict_review_sentiment(req.text)
    except Exception as e:
        logger.error("Sentiment prediction error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/sentiment/predict-batch")
def predict_sentiment_batch(req: SentimentBatchPredictRequest):
    if not sentiment_store.is_ready:
        ok = load_sentiment_model()
        if not ok:
            raise HTTPException(status_code=503, detail="Sentiment model is not ready.")

    try:
        return [predict_review_sentiment(text) for text in req.texts]
    except Exception as e:
        logger.error("Sentiment batch prediction error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.post("/api/sentiment/label-db-reviews")
def label_database_reviews():
    """Trigger batch labeling directly into MySQL database."""
    try:
        res = label_all_reviews_in_db()
        return {
            "status": "SUCCESS",
            "message": f"Successfully labeled {res['total_updated']} reviews in database.",
            **res
        }
    except Exception as e:
        logger.error("DB labeling error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"DB labeling failed: {str(e)}")


# --- Job Moderation & Scam Detection Endpoints ---

class JobModerationRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    requirements: Optional[str] = ""
    level: Optional[str] = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None


@app.post("/api/moderation/predict")
def predict_job_moderation(req: JobModerationRequest):
    """
    Evaluates a job posting using Rule Heuristics + PhoBERT deep sequence classification.
    Returns:
    - label: 'an_toan' (clean), 'nghi_van' (suspicious), or 'nguy_co_cao' (high risk)
    - score: float confidence score (0.0 - 1.0)
    - reasons: human-readable explanation of matched violations
    - probabilities: raw class probabilities dict
    """
    if not moderator.is_ready:
        ok = moderator.load_model()
        if not ok:
            logger.warning("Job moderation model not ready, using heuristic fallback.")

    try:
        return moderator.predict(
            title=req.title,
            description=req.description,
            requirements=req.requirements,
            level=req.level,
            salary_min=req.salary_min,
            salary_max=req.salary_max
        )
    except Exception as e:
        logger.error("Job moderation prediction error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Moderation failed: {str(e)}")


@app.post("/api/moderation/label-db-jobs")
def label_database_jobs(only_pending: bool = False):
    """
    Scans MySQL jobs, ensures columns (moderation_label, moderation_score, moderation_reasons) exist,
    and predicts moderation labels for all jobs in database.
    """
    if not moderator.is_ready:
        moderator.load_model()

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
            # 1. Ensure columns exist
            cursor.execute("DESCRIBE jobs")
            existing_cols = [c["Field"] for c in cursor.fetchall()]

            if "moderation_label" not in existing_cols:
                logger.info("Adding column 'moderation_label' to jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_label VARCHAR(50) DEFAULT NULL")
                conn.commit()

            if "moderation_score" not in existing_cols:
                logger.info("Adding column 'moderation_score' to jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_score DOUBLE DEFAULT NULL")
                conn.commit()

            if "moderation_reasons" not in existing_cols:
                logger.info("Adding column 'moderation_reasons' to jobs...")
                cursor.execute("ALTER TABLE jobs ADD COLUMN moderation_reasons TEXT DEFAULT NULL")
                conn.commit()

            # 2. Select jobs
            sql = "SELECT id, title, description, requirements, level, salary_min, salary_max, status FROM jobs"
            if only_pending:
                sql += " WHERE status = 'pending_review'"
            sql += " ORDER BY id ASC"

            cursor.execute(sql)
            jobs = cursor.fetchall()

            counts = {"an_toan": 0, "nghi_van": 0, "nguy_co_cao": 0}
            updated_items = []

            for j in jobs:
                j_id = j["id"]
                title = j.get("title") or ""
                desc = j.get("description") or ""
                req = j.get("requirements") or ""
                lvl = j.get("level") or ""
                s_min = float(j["salary_min"]) if j.get("salary_min") else None
                s_max = float(j["salary_max"]) if j.get("salary_max") else None

                res = moderator.predict(
                    title=title,
                    description=desc,
                    requirements=req,
                    level=lvl,
                    salary_min=s_min,
                    salary_max=s_max
                )

                lbl = res["label"]
                score = res["score"]
                reasons = res["reasons"]

                counts[lbl] = counts.get(lbl, 0) + 1

                cursor.execute("""
                    UPDATE jobs
                    SET moderation_label = %s,
                        moderation_score = %s,
                        moderation_reasons = %s
                    WHERE id = %s
                """, (lbl, score, reasons, j_id))

                updated_items.append({
                    "id": j_id,
                    "title": title[:50],
                    "status": j.get("status"),
                    "moderation_label": lbl,
                    "moderation_score": score,
                    "moderation_reasons": reasons
                })

            conn.commit()
            logger.info("Successfully labeled %d jobs in MySQL: %s", len(updated_items), counts)

            return {
                "status": "SUCCESS",
                "message": f"Successfully labeled {len(updated_items)} jobs in database.",
                "total_scanned": len(updated_items),
                "summary": counts,
                "jobs": updated_items
            }
    except Exception as e:
        logger.error("DB job moderation error: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"DB job moderation failed: {str(e)}")
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
