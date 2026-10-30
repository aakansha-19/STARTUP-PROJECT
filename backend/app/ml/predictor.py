import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.ml.trainer import load_model_and_metrics, FEATURE_NAMES

# Cache model in memory
_pipeline = None
_metrics = None


def get_model():
    global _pipeline, _metrics
    if _pipeline is None:
        _pipeline, _metrics = load_model_and_metrics()
    return _pipeline, _metrics


def predict_placement_probability(
    cgpa: float,
    relevant_skill_count: int,
    project_count: int,
    internship_count: int,
    skill_match_percentage: float
) -> Tuple[float, str, Dict[str, Any]]:
    """
    Predicts probability of placement using the trained pipeline.
    Applies input validation, normalization, and attaches honest status.
    """
    pipeline, metrics = get_model()

    # Normalize/clamp features
    effective_cgpa = 7.0 if (cgpa is None or cgpa <= 0) else min(10.0, max(0.0, float(cgpa)))
    effective_skills = min(20, max(0, int(relevant_skill_count)))
    effective_projects = min(15, max(0, int(project_count)))
    effective_internships = min(10, max(0, int(internship_count)))
    effective_match = min(100.0, max(0.0, float(skill_match_percentage)))

    input_df = pd.DataFrame([{
        "cgpa": effective_cgpa,
        "relevant_skill_count": effective_skills,
        "project_count": effective_projects,
        "internship_count": effective_internships,
        "skill_match_percentage": effective_match
    }])[FEATURE_NAMES]

    probabilities = pipeline.predict_proba(input_df)[0]
    prob_placed = float(probabilities[1])

    status_label = "Benchmark Model (Synthetic Labeled Pipeline - Not Scientifically Validated)"

    details = {
        "predicted_probability": round(prob_placed, 4),
        "predicted_probability_percent": round(prob_placed * 100, 1),
        "model_status": status_label,
        "model_accuracy": metrics.get("accuracy"),
        "model_f1_score": metrics.get("f1_score"),
        "features_evaluated": {
            "cgpa": effective_cgpa,
            "relevant_skill_count": effective_skills,
            "project_count": effective_projects,
            "internship_count": effective_internships,
            "skill_match_percentage": effective_match
        }
    }

    return prob_placed, status_label, details
