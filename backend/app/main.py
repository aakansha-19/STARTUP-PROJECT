import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.database import engine, Base, SessionLocal
from app.models import AnalysisRecord
from app.routes import health, roles, recommendations, analysis, ml
from app.ml.trainer import load_model_and_metrics


def seed_demo_data_if_empty():
    """Seeds a realistic sample analysis so the dashboard is immediately informative on initial launch."""
    db = SessionLocal()
    try:
        count = db.query(AnalysisRecord).count()
        if count == 0:
            demo_record = AnalysisRecord(
                candidate_name="Alex Chen",
                filename="alex_chen_resume.pdf",
                target_role_id="data-analyst",
                target_role_title="Data Analyst",
                readiness_score=78.5,
                readiness_level="Moderate Readiness",
                skill_match_percentage=75.0,
                cgpa=8.4,
                project_count=2,
                internship_count=1,
                certifications_count=1,
                ml_placement_probability=0.74,
                ml_status="Benchmark Model (Synthetic Labeled Pipeline - Demonstration)",
                score_breakdown_json=json.dumps({
                    "skill_match_score": 37.5,
                    "skill_match_max": 50.0,
                    "projects_score": 15.0,
                    "projects_max": 20.0,
                    "internships_score": 10.0,
                    "internships_max": 15.0,
                    "academics_score": 16.0,
                    "academics_max": 15.0,
                    "academics_note": "Evaluated from provided CGPA 8.40/10",
                    "total_score": 78.5,
                    "formula_explanation": "Transparent Heuristic Score: 50% Skill Match + 20% Projects + 15% Internships + 15% Academics."
                }),
                extracted_skills_json=json.dumps(["Python", "SQL", "Excel", "Data Visualization", "Pandas", "NumPy", "Git"]),
                matched_skills_json=json.dumps(["SQL", "Python", "Excel", "Data Visualization", "Pandas", "NumPy", "Git"]),
                missing_skills_json=json.dumps([
                    {"skill": "Power BI", "importance": "Required", "weight": 1.3, "learning_priority": 1},
                    {"skill": "Statistics", "importance": "Required", "weight": 1.1, "learning_priority": 2},
                    {"skill": "Tableau", "importance": "Preferred", "weight": 0.8, "learning_priority": 3},
                    {"skill": "REST APIs", "importance": "Preferred", "weight": 0.5, "learning_priority": 4}
                ]),
                improvement_suggestions_json=json.dumps([
                    "Prioritize foundational required skills first: focus immediately on Power BI and Statistics.",
                    "Ensure your project descriptions highlight measurable outcomes (e.g., latency reduction or data volume processed).",
                    "Include active GitHub repository links for every listed technical project."
                ]),
                recommendations_json=json.dumps([
                    {
                        "skill": "Power BI",
                        "importance": "Required",
                        "priority": 1,
                        "course_name": "Microsoft Power BI Data Analyst Professional Certificate",
                        "provider": "Microsoft / Coursera",
                        "course_url": "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst",
                        "alternate_resource": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
                        "difficulty": "Beginner to Intermediate",
                        "estimated_weeks": 3,
                        "project_idea": "Design an Executive Sales & Operations KPI Dashboard featuring automated data refresh and DAX measures.",
                        "key_topics": ["Power Query Data Transformation", "Data Modeling & Relationships", "DAX Calculated Measures"]
                    },
                    {
                        "skill": "Statistics",
                        "importance": "Required",
                        "priority": 2,
                        "course_name": "Introduction to Statistics",
                        "provider": "Stanford Online / Coursera",
                        "course_url": "https://www.coursera.org/learn/stanford-statistics",
                        "alternate_resource": "https://www.khanacademy.org/math/statistics-probability",
                        "difficulty": "Intermediate",
                        "estimated_weeks": 4,
                        "project_idea": "Conduct an A/B Testing Experiment Case Study on website conversion rates, computing p-values and confidence intervals.",
                        "key_topics": ["Probability Distributions", "Hypothesis Testing", "Confidence Intervals"]
                    }
                ]),
                extracted_metadata_json=json.dumps({
                    "degrees_found": ["B.Tech / B.E.", "CS/IT Domain"],
                    "cgpa_detected": 8.4,
                    "cgpa_confidence": "Extracted",
                    "projects_detected": 2,
                    "internships_detected": 1,
                    "certifications_detected": 1,
                    "has_contact_info": True,
                    "raw_word_count": 420
                })
            )
            db.add(demo_record)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning seeding demo data: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    Base.metadata.create_all(bind=engine)
    seed_demo_data_if_empty()
    # Train / Load ML benchmark pipeline
    try:
        load_model_and_metrics()
    except Exception as e:
        print(f"Warning initializing ML model: {e}")
    yield


app = FastAPI(
    title="AI Placement Readiness Predictor API",
    description="Full-stack AI placement readiness evaluation, NLP resume skill extraction, and recommendation engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:4173",
]
if cors_origins_env:
    for origin in cors_origins_env.split(","):
        cleaned = origin.strip()
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(ml.router, prefix="/api")


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "AI Placement Readiness Predictor API is running.",
        "documentation": "/docs",
        "health": "/api/health",
        "roles": "/api/roles"
    }
