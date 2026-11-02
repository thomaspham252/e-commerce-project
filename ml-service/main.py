import os
import re
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional, Set

from dotenv import load_dotenv
import pymysql
import pymysql.cursors
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("JobRecommender")

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "job_portal_db")
DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
PORT = int(os.getenv("PORT", "8000"))

class ModelStore:
    jobs_df: pd.DataFrame = pd.DataFrame()
    cosine_sim_matrix: np.ndarray = np.empty((0, 0))
    id_to_idx: Dict[int, int] = {}
    idx_to_id: Dict[int, int] = {}
    is_ready: bool = False

store = ModelStore()

def normalize_tech_tokens(text: str) -> str:
    """Preserve technology acronyms that standard tokenizers would split or drop."""
    if not text or not isinstance(text, str):
        return ""
    
    t = text.lower()
    # Mask C++ and C#
    t = re.sub(r'\bc\+\+\b', 'cpp', t)
    t = re.sub(r'\bc#\b', 'csharp', t)
    # Mask .NET / ASP.NET
    t = re.sub(r'\basp\.net\b', 'aspdotnet', t)
    t = re.sub(r'\b\.net\b', 'dotnet', t)
    # Mask Node.js, Vue.js, React.js, Next.js, Nuxt.js
    t = re.sub(r'\bnode\.js\b', 'nodejs', t)
    t = re.sub(r'\bvue\.js\b', 'vuejs', t)
    t = re.sub(r'\breact\.js\b', 'reactjs', t)
    t = re.sub(r'\bnext\.js\b', 'nextjs', t)
    t = re.sub(r'\bnuxt\.js\b', 'nuxtjs', t)
    
    # Remove unwanted punctuation but keep alphanumeric and spaces
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
        store.jobs_df = df
        store.cosine_sim_matrix = np.empty((0, 0))
        store.id_to_idx = {}
        store.idx_to_id = {}
        store.is_ready = True
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

        # Weighted combination: Title x4, Skills x4, Level x2, Location x1, Desc x1, Req x1
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

    store.jobs_df = df
    store.cosine_sim_matrix = cosine_sim
    store.id_to_idx = id_to_idx
    store.idx_to_id = idx_to_id
    store.is_ready = True

    logger.info("Job Recommendation Matrix successfully built and cached in memory!")
    return len(df)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        count = build_recommendation_matrix()
        logger.info("Startup complete. Indexed %d jobs.", count)
    except Exception as e:
        logger.error("Failed to build recommendation matrix at startup: %s", str(e), exc_info=True)
    yield
    logger.info("ML Recommendation Service shutting down.")

app = FastAPI(
    title="Job Recommendation ML Service",
    description="Content-based IT Job Recommendation Engine using TF-IDF & Cosine Similarity",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP" if store.is_ready else "INITIALIZING",
        "total_jobs_indexed": len(store.jobs_df),
        "matrix_shape": list(store.cosine_sim_matrix.shape) if store.is_ready else []
    }

@app.get("/api/related-jobs/{job_id}")
def get_related_jobs(job_id: int, top_k: int = Query(6, ge=1, le=20)):
    if not store.is_ready or store.jobs_df.empty:
        raise HTTPException(status_code=503, detail="Recommendation engine is still initializing or empty.")

    if job_id not in store.id_to_idx:
        raise HTTPException(status_code=404, detail=f"Job ID {job_id} not found in active index.")

    target_idx = store.id_to_idx[job_id]
    target_row = store.jobs_df.iloc[target_idx]
    target_skills_list = parse_skills_list(target_row.get("skills"))
    target_skills_lower = {s.lower(): s for s in target_skills_list}

    sim_scores = store.cosine_sim_matrix[target_idx]
    indexed_scores = [(idx, score) for idx, score in enumerate(sim_scores) if idx != target_idx]
    indexed_scores.sort(key=lambda x: x[1], reverse=True)

    top_matches = indexed_scores[:top_k]
    results = []

    for idx, score in top_matches:
        candidate_id = store.idx_to_id[idx]
        candidate_row = store.jobs_df.iloc[idx]
        candidate_skills_list = parse_skills_list(candidate_row.get("skills"))

        # Find common skills preserving original proper casing
        matched = []
        for cs in candidate_skills_list:
            if cs.lower() in target_skills_lower:
                matched.append(cs)

        raw_score = float(score)
        # Scale raw cosine score (0.05 to 0.28) into intuitive percentage (68% - 98%)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
