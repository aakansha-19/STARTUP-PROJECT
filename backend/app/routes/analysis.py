import json
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AnalysisRecord
from app.schemas import (
    AnalysisResponse,
    AnalysisListItem,
    ManualAnalysisRequest,
)
from app.services.pdf_extractor import extract_text_from_pdf_bytes, PDFExtractionError
from app.services.skill_extractor import SkillExtractor
from app.services.readiness_engine import ReadinessEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.report_generator import generate_pdf_report, generate_csv_report
from app.ml.predictor import predict_placement_probability

router = APIRouter(prefix="/analyses", tags=["Analysis"])

skill_extractor = SkillExtractor()
readiness_engine = ReadinessEngine()
recommendation_engine = RecommendationEngine()


def _process_analysis_pipeline(
    raw_text: str,
    filename: str,
    target_role_id: str,
    manual_cgpa: Optional[float] = None,
    manual_projects: Optional[int] = None,
    manual_internships: Optional[int] = None,
    candidate_name: Optional[str] = None,
    db: Session = None
) -> AnalysisRecord:
    # 1. Validate Job Role
    cleaned_role_id = target_role_id.strip().lower() if target_role_id else ""
    role = readiness_engine.get_role(cleaned_role_id)
    if not role:
        raise HTTPException(
            status_code=400,
            detail=f"Target role '{target_role_id}' is invalid. Available roles: data-analyst, software-developer, data-scientist, sde."
        )

    # 2. Extract Skills and Profile Signals
    extracted_skills = skill_extractor.extract_skills(raw_text)
    metadata = skill_extractor.extract_metadata(raw_text)

    # Candidate Name Resolution
    clean_name = candidate_name.strip() if candidate_name and isinstance(candidate_name, str) and candidate_name.strip() else None
    resolved_name = clean_name or metadata.get("candidate_name") or "Student"

    # Profile Values Resolution (Manual input overrides or supplements automated extraction)
    if manual_cgpa is not None and manual_cgpa > 0:
        resolved_cgpa = min(10.0, max(0.0, round(float(manual_cgpa), 2)))
    elif metadata.get("cgpa_detected") is not None:
        resolved_cgpa = round(float(metadata["cgpa_detected"]), 2)
    else:
        resolved_cgpa = None

    if manual_projects is not None and manual_projects >= 0:
        resolved_projects = int(manual_projects)
    else:
        resolved_projects = metadata.get("projects_detected", 0)

    if manual_internships is not None and manual_internships >= 0:
        resolved_internships = int(manual_internships)
    else:
        resolved_internships = metadata.get("internships_detected", 0)

    certifications_count = metadata.get("certifications_detected", 0)

    # 3. Analyze Skill Gap
    skill_gap = readiness_engine.analyze_skill_gap(extracted_skills, cleaned_role_id)
    skill_match_pct = skill_gap["skill_match_percentage"]
    matched_skills = skill_gap["matched_skills"]
    missing_skills = skill_gap["missing_skills"]

    # 4. Calculate Transparent Heuristic Readiness Score
    readiness_score, readiness_level, score_breakdown = readiness_engine.calculate_readiness_score(
        skill_match_percentage=skill_match_pct,
        project_count=resolved_projects,
        internship_count=resolved_internships,
        cgpa=resolved_cgpa,
        extracted_skills=extracted_skills
    )

    # 5. Generate Personalized Improvement Suggestions
    suggestions = readiness_engine.generate_improvement_suggestions(
        extracted_skills=extracted_skills,
        missing_skills=missing_skills,
        project_count=resolved_projects,
        internship_count=resolved_internships,
        cgpa=resolved_cgpa,
        raw_text=raw_text
    )

    # 6. Generate Personalized Recommendations
    recommendations = recommendation_engine.get_recommendations_for_missing_skills(
        missing_skills=missing_skills,
        role_id=cleaned_role_id
    )

    # 7. Predict Benchmark ML Placement Probability (with graceful fallback if model fails)
    try:
        prob, ml_status, ml_details = predict_placement_probability(
            cgpa=resolved_cgpa,
            relevant_skill_count=len(matched_skills),
            project_count=resolved_projects,
            internship_count=resolved_internships,
            skill_match_percentage=skill_match_pct
        )
    except Exception as e:
        prob = None
        ml_status = f"Benchmark Model Temporarily Unavailable ({str(e)})"

    # 8. Persist Analysis Record in SQLite
    record = AnalysisRecord(
        candidate_name=resolved_name,
        filename=filename,
        target_role_id=cleaned_role_id,
        target_role_title=role.get("title", cleaned_role_id),
        readiness_score=readiness_score,
        readiness_level=readiness_level,
        skill_match_percentage=skill_match_pct,
        cgpa=resolved_cgpa,
        project_count=resolved_projects,
        internship_count=resolved_internships,
        certifications_count=certifications_count,
        ml_placement_probability=prob,
        ml_status=ml_status,
        score_breakdown_json=json.dumps(score_breakdown),
        extracted_skills_json=json.dumps(extracted_skills),
        matched_skills_json=json.dumps(matched_skills),
        missing_skills_json=json.dumps(missing_skills),
        improvement_suggestions_json=json.dumps(suggestions),
        recommendations_json=json.dumps(recommendations),
        extracted_metadata_json=json.dumps(metadata)
    )

    if db:
        db.add(record)
        db.commit()
        db.refresh(record)

    return record


@router.post("/analyze-resume", response_model=AnalysisResponse)
async def analyze_uploaded_resume(
    file: UploadFile = File(...),
    target_role_id: str = Form(...),
    cgpa: Optional[Union[float, str]] = Form(None),
    project_count: Optional[Union[int, str]] = Form(None),
    internship_count: Optional[Union[int, str]] = Form(None),
    candidate_name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded PDF resume, extracts text with PyMuPDF, performs NLP skill extraction,
    calculates readiness metrics, and stores the persistent analysis result.
    """
    # Safely parse numeric fields that may be submitted as empty strings by browser FormData
    parsed_cgpa = None
    if cgpa is not None:
        try:
            val = float(str(cgpa).strip())
            if val > 0:
                parsed_cgpa = val
        except (ValueError, TypeError):
            parsed_cgpa = None

    parsed_projects = None
    if project_count is not None:
        try:
            val = int(str(project_count).strip())
            if val >= 0:
                parsed_projects = val
        except (ValueError, TypeError):
            parsed_projects = None

    parsed_internships = None
    if internship_count is not None:
        try:
            val = int(str(internship_count).strip())
            if val >= 0:
                parsed_internships = val
        except (ValueError, TypeError):
            parsed_internships = None

    # Validate extension and mime
    filename = file.filename or "uploaded_resume.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF document (.pdf)."
        )

    # Check content size (max 10MB)
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum supported PDF size is 10 MB.")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="The uploaded PDF file is empty (0 bytes).")

    # Extract text from PDF in memory (temporary buffer safely discarded right after)
    try:
        extracted_text, _ = extract_text_from_pdf_bytes(content, filename=filename)
    except PDFExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error parsing resume PDF: {str(e)}")

    record = _process_analysis_pipeline(
        raw_text=extracted_text,
        filename=filename,
        target_role_id=target_role_id,
        manual_cgpa=parsed_cgpa,
        manual_projects=parsed_projects,
        manual_internships=parsed_internships,
        candidate_name=candidate_name,
        db=db
    )

    return AnalysisResponse(**record.to_dict())


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_raw_text(
    payload: ManualAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyzes raw resume text directly (useful for manual pasting or API automation).
    """
    record = _process_analysis_pipeline(
        raw_text=payload.resume_text,
        filename="manual_input.txt",
        target_role_id=payload.target_role_id,
        manual_cgpa=payload.cgpa,
        manual_projects=payload.project_count,
        manual_internships=payload.internship_count,
        candidate_name=payload.candidate_name,
        db=db
    )

    return AnalysisResponse(**record.to_dict())


@router.get("", response_model=List[AnalysisListItem])
def list_analyses(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lists recent analyses ordered by timestamp descending."""
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).limit(limit).all()
    return [
        AnalysisListItem(
            id=r.id,
            candidate_name=r.candidate_name,
            filename=r.filename,
            target_role_id=r.target_role_id,
            target_role_title=r.target_role_title,
            readiness_score=round(r.readiness_score, 1),
            readiness_level=r.readiness_level,
            skill_match_percentage=round(r.skill_match_percentage, 1),
            created_at=r.created_at.isoformat() if r.created_at else None
        )
        for r in records
    ]


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Fetches full detailed analysis by ID."""
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis #{analysis_id} not found.")
    return AnalysisResponse(**record.to_dict())


@router.get("/{analysis_id}/report")
def export_analysis_report(
    analysis_id: int,
    format: str = Query("pdf", pattern="^(pdf|csv)$"),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a structured report for an analysis in PDF or CSV format.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis #{analysis_id} not found.")

    analysis_dict = record.to_dict()

    if format == "csv":
        csv_content = generate_csv_report(analysis_dict)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=placement_readiness_report_{analysis_id}.csv"
            }
        )

    # PDF format
    pdf_bytes = generate_pdf_report(analysis_dict)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=placement_readiness_report_{analysis_id}.pdf"
        }
    )
