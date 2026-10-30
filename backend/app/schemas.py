from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    database: str
    nlp_status: str
    ml_status: str


class ProjectIdea(BaseModel):
    title: str
    description: str
    recommended_skills: List[str] = Field(default_factory=list)


class RoleSummary(BaseModel):
    id: str
    title: str
    short_description: str
    required_skills_count: int
    preferred_skills_count: int


class RoleDetail(BaseModel):
    id: str
    title: str
    short_description: str
    overview: str
    required_skills: List[str]
    preferred_skills: List[str]
    skill_weights: Dict[str, float]
    example_projects: List[ProjectIdea]


class ScoreBreakdown(BaseModel):
    skill_match_score: float = Field(..., description="Calculated contribution from skills (0-50 max weight)")
    projects_score: float = Field(..., description="Calculated contribution from relevant projects (0-20 max weight)")
    internships_score: float = Field(..., description="Calculated contribution from internship experience (0-15 max weight)")
    academics_score: float = Field(..., description="Calculated contribution from academic CGPA/percentage (0-15 max weight)")
    total_score: float = Field(..., description="Sum of all weighted components (0-100)")
    formula_explanation: str = Field(..., description="Plain-English explanation of scoring methodology")


class MissingSkillDetail(BaseModel):
    skill: str
    importance: str = Field(..., description="'Required' or 'Preferred'")
    weight: float
    learning_priority: int = Field(..., description="Rank priority, 1 being highest priority")


class SkillRecommendation(BaseModel):
    skill: str
    importance: str
    priority: int
    course_name: str
    provider: str
    course_url: str
    alternate_resource: Optional[str] = None
    difficulty: str
    estimated_weeks: int
    project_idea: str
    key_topics: List[str] = Field(default_factory=list)


class ExtractedProfileMetadata(BaseModel):
    degrees_found: List[str] = Field(default_factory=list)
    cgpa_detected: Optional[float] = None
    cgpa_confidence: str = "Not Found"
    projects_detected: int = 0
    internships_detected: int = 0
    certifications_detected: int = 0
    has_contact_info: bool = False
    raw_word_count: int = 0


class ManualAnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Raw text of the resume or portfolio")
    target_role_id: str = Field(..., description="Selected target role ID")
    candidate_name: Optional[str] = "Candidate"
    cgpa: Optional[float] = Field(None, ge=0.0, le=10.0, description="Manual CGPA on 10.0 scale")
    project_count: Optional[int] = Field(None, ge=0, le=50, description="Number of completed projects")
    internship_count: Optional[int] = Field(None, ge=0, le=20, description="Number of internships completed")
    certifications_count: Optional[int] = Field(None, ge=0, le=50, description="Number of certifications")


class AnalysisResponse(BaseModel):
    id: int
    candidate_name: str
    filename: str
    target_role_id: str
    target_role_title: str
    readiness_score: float
    readiness_level: str
    skill_match_percentage: float
    cgpa: Optional[float]
    project_count: int
    internship_count: int
    certifications_count: int
    ml_placement_probability: Optional[float]
    ml_status: str
    score_breakdown: Dict[str, Any]
    extracted_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[MissingSkillDetail]
    improvement_suggestions: List[str]
    recommendations: List[SkillRecommendation]
    extracted_metadata: Dict[str, Any]
    created_at: Optional[str]


class AnalysisListItem(BaseModel):
    id: int
    candidate_name: str
    filename: str
    target_role_id: str
    target_role_title: str
    readiness_score: float
    readiness_level: str
    skill_match_percentage: float
    created_at: Optional[str]


class MLMetricsResponse(BaseModel):
    status: str
    model_name: str
    description: str
    sample_size: int
    train_test_split: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    feature_names: List[str]
    feature_coefficients: Dict[str, float]
    disclaimer: str
