import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Text, DateTime
from app.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_name = Column(String(120), nullable=True, default="Candidate")
    filename = Column(String(255), nullable=False, default="manual_input.txt")
    target_role_id = Column(String(64), nullable=False, index=True)
    target_role_title = Column(String(128), nullable=False)
    
    # Core Evaluation Metrics
    readiness_score = Column(Float, nullable=False, default=0.0)
    readiness_level = Column(String(32), nullable=False, default="Needs Preparation")
    skill_match_percentage = Column(Float, nullable=False, default=0.0)
    
    # Profile Inputs & Extractions
    cgpa = Column(Float, nullable=True)
    project_count = Column(Integer, nullable=False, default=0)
    internship_count = Column(Integer, nullable=False, default=0)
    certifications_count = Column(Integer, nullable=False, default=0)
    
    # Machine Learning Output & Honest Annotation
    ml_placement_probability = Column(Float, nullable=True)
    ml_status = Column(String(128), nullable=False, default="Benchmark Model (Synthetic Labeled Pipeline)")

    # Serialized Structured Analytics Data (Stored as JSON text for SQLite compatibility)
    score_breakdown_json = Column(Text, nullable=False, default="{}")
    extracted_skills_json = Column(Text, nullable=False, default="[]")
    matched_skills_json = Column(Text, nullable=False, default="[]")
    missing_skills_json = Column(Text, nullable=False, default="[]")
    improvement_suggestions_json = Column(Text, nullable=False, default="[]")
    recommendations_json = Column(Text, nullable=False, default="[]")
    extracted_metadata_json = Column(Text, nullable=False, default="{}")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        """Helper to serialize model instance to a clean dictionary."""
        return {
            "id": self.id,
            "candidate_name": self.candidate_name,
            "filename": self.filename,
            "target_role_id": self.target_role_id,
            "target_role_title": self.target_role_title,
            "readiness_score": round(self.readiness_score, 1),
            "readiness_level": self.readiness_level,
            "skill_match_percentage": round(self.skill_match_percentage, 1),
            "cgpa": self.cgpa,
            "project_count": self.project_count,
            "internship_count": self.internship_count,
            "certifications_count": self.certifications_count,
            "ml_placement_probability": round(self.ml_placement_probability * 100, 1) if self.ml_placement_probability is not None else None,
            "ml_status": self.ml_status,
            "score_breakdown": json.loads(self.score_breakdown_json or "{}"),
            "extracted_skills": json.loads(self.extracted_skills_json or "[]"),
            "matched_skills": json.loads(self.matched_skills_json or "[]"),
            "missing_skills": json.loads(self.missing_skills_json or "[]"),
            "improvement_suggestions": json.loads(self.improvement_suggestions_json or "[]"),
            "recommendations": json.loads(self.recommendations_json or "[]"),
            "extracted_metadata": json.loads(self.extracted_metadata_json or "{}"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
