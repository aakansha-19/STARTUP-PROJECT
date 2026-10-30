import os
from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.skill_extractor import SPACY_AVAILABLE
from app.ml.trainer import METRICS_FILE

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health_status():
    return HealthResponse(
        status="healthy",
        service="AI Placement Readiness Predictor API",
        version="1.0.0",
        database="SQLite (SQLAlchemy ORM)",
        nlp_status="spaCy Loaded" if SPACY_AVAILABLE else "Regex Tokenizer & NLP Phrase Matcher (Active Fallback)",
        ml_status="Trained & Ready" if os.path.exists(METRICS_FILE) else "Initialized on demand"
    )
