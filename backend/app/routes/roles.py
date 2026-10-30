from typing import List
from fastapi import APIRouter, HTTPException
from app.services.readiness_engine import ReadinessEngine
from app.schemas import RoleDetail, RoleSummary

router = APIRouter(prefix="/roles", tags=["Roles"])
engine = ReadinessEngine()


@router.get("", response_model=List[RoleSummary])
def get_all_roles():
    """Returns curated job roles with summary metrics."""
    roles = engine.get_all_roles()
    return [
        RoleSummary(
            id=r["id"],
            title=r["title"],
            short_description=r.get("short_description", ""),
            required_skills_count=len(r.get("required_skills", [])),
            preferred_skills_count=len(r.get("preferred_skills", []))
        )
        for r in roles
    ]


@router.get("/{role_id}", response_model=RoleDetail)
def get_role_by_id(role_id: str):
    """Returns detailed role information including required skills, weights, and projects."""
    role = engine.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Job role '{role_id}' not found.")
    return RoleDetail(
        id=role["id"],
        title=role["title"],
        short_description=role.get("short_description", ""),
        overview=role.get("overview", ""),
        required_skills=role.get("required_skills", []),
        preferred_skills=role.get("preferred_skills", []),
        skill_weights=role.get("skill_weights", {}),
        example_projects=role.get("example_projects", [])
    )
