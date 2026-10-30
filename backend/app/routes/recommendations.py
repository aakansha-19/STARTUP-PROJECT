from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.readiness_engine import ReadinessEngine
from app.services.recommendation_engine import RecommendationEngine
from app.schemas import SkillRecommendation

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
readiness_engine = ReadinessEngine()
recommendation_engine = RecommendationEngine()


@router.get("/{role_id}", response_model=List[SkillRecommendation])
def get_recommendations_for_role(
    role_id: str,
    limit: Optional[int] = Query(10, ge=1, le=25)
):
    """
    Returns curated learning path recommendations for all skills relevant to the target role.
    """
    role = readiness_engine.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Job role '{role_id}' not found.")

    required = role.get("required_skills", [])
    preferred = role.get("preferred_skills", [])
    weights = role.get("skill_weights", {})

    missing_items = []
    priority = 1
    for s in sorted(required, key=lambda x: weights.get(x, 1.0), reverse=True):
        missing_items.append({"skill": s, "importance": "Required", "learning_priority": priority})
        priority += 1

    for s in sorted(preferred, key=lambda x: weights.get(x, 0.5), reverse=True):
        missing_items.append({"skill": s, "importance": "Preferred", "learning_priority": priority})
        priority += 1

    recs = recommendation_engine.get_recommendations_for_missing_skills(missing_items, role_id=role_id)
    return recs[:limit]
