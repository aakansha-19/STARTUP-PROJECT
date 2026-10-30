import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.services.skill_extractor import SkillExtractor
from app.services.readiness_engine import ReadinessEngine
from app.services.recommendation_engine import RecommendationEngine

from sqlalchemy.pool import StaticPool

# In-memory SQLite with StaticPool so tables persist across sessions
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=test_engine)


def create_sample_pdf_bytes(text_content: str) -> bytes:
    """Helper to generate a real, valid PDF in memory using fitz (PyMuPDF)."""
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text_content, fontsize=11)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


# 1. Health Endpoint Test
def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "nlp_status" in data


# 2. Roles Endpoint Tests
def test_get_roles(client):
    response = client.get("/api/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) == 4
    role_ids = [r["id"] for r in roles]
    assert "data-analyst" in role_ids
    assert "software-developer" in role_ids
    assert "data-scientist" in role_ids
    assert "sde" in role_ids


def test_get_single_role_detail(client):
    response = client.get("/api/roles/data-analyst")
    assert response.status_code == 200
    role = response.json()
    assert role["title"] == "Data Analyst"
    assert "SQL" in role["required_skills"]
    assert len(role["example_projects"]) >= 2


def test_get_invalid_role(client):
    response = client.get("/api/roles/non-existent-role")
    assert response.status_code == 404


# 3. Unit Test: Skill Extraction & Metadata
def test_skill_extractor_accuracy():
    extractor = SkillExtractor()
    sample_text = """
    Software Engineer skilled in Python, SQL, React, JavaScript, HTML, CSS, Git, and FastAPI.
    Familiar with Data Structures and Algorithms.
    Education: B.Tech Computer Science | CGPA: 8.75/10
    """
    skills = extractor.extract_skills(sample_text)
    assert "Python" in skills
    assert "SQL" in skills
    assert "React" in skills
    assert "JavaScript" in skills
    assert "FastAPI" in skills
    assert "Data Structures and Algorithms" in skills

    metadata = extractor.extract_metadata(sample_text)
    assert metadata["cgpa_detected"] == 8.75
    assert "B.Tech / B.E." in metadata["degrees_found"]


# 4. Unit Test: Skill Gap and Readiness Calculation
def test_readiness_engine_gap_and_score():
    engine = ReadinessEngine()
    extracted = ["Python", "SQL", "Excel", "Data Visualization"]
    gap = engine.analyze_skill_gap(extracted, "data-analyst")
    assert gap["skill_match_percentage"] > 0
    assert "SQL" in gap["matched_skills"]
    assert any(m["skill"] == "Power BI" for m in gap["missing_skills"])

    score, level, breakdown = engine.calculate_readiness_score(
        skill_match_percentage=gap["skill_match_percentage"],
        project_count=2,
        internship_count=1,
        cgpa=8.5
    )
    assert 0 <= score <= 100
    assert breakdown["projects_score"] == 15.0
    assert breakdown["internships_score"] == 10.0


# 5. Unit Test: Recommendations Engine
def test_recommendation_engine():
    rec_engine = RecommendationEngine()
    missing = [
        {"skill": "SQL", "importance": "Required", "learning_priority": 1},
        {"skill": "Power BI", "importance": "Required", "learning_priority": 2}
    ]
    recs = rec_engine.get_recommendations_for_missing_skills(missing)
    assert len(recs) == 2
    assert recs[0]["skill"] == "SQL"
    assert "coursera.org" in recs[0]["course_url"] or "freecodecamp.org" in recs[0]["course_url"]
    assert len(recs[0]["project_idea"]) > 10


# 6. Manual Text Analysis API Test
def test_analyze_manual_text_endpoint(client):
    payload = {
        "resume_text": """
        Priya Sharma
        priya@example.com
        Education: B.Tech in IT | CGPA: 8.6/10
        Skills: Python, Machine Learning, Statistics, Pandas, NumPy, SQL, Git
        Projects:
        - Predictive Healthcare Model using Random Forest and Pandas
        - Exploratory Data Analysis on Customer Attrition
        Internships:
        - Data Science Intern at InnovateAI for 6 months
        """,
        "target_role_id": "data-scientist",
        "cgpa": 8.6,
        "project_count": 2,
        "internship_count": 1
    }
    response = client.post("/api/analyses/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_role_id"] == "data-scientist"
    assert data["readiness_score"] >= 65.0
    assert "Python" in data["matched_skills"]
    assert "Machine Learning" in data["matched_skills"]
    assert data["ml_placement_probability"] is not None
    assert "id" in data


# 7. PDF Resume Upload API Test (Valid PDF)
def test_analyze_valid_pdf_resume(client):
    resume_content = """
    Rohan Patel
    rohan@example.com | 9876543210
    Education:
    Bachelor of Technology in Computer Science
    CGPA: 8.2 / 10

    Technical Skills:
    Java, C++, Data Structures and Algorithms, SQL, Git, REST APIs, Python

    Projects:
    1. Distributed Cache System: Developed an in-memory LRU cache in Java with multithreading.
    2. URL Shortener Microservice: Built a high-throughput REST API using Python and SQL.

    Work Experience:
    Software Engineering Intern at CloudTech: Optimized database queries and built backend microservices.
    """
    pdf_bytes = create_sample_pdf_bytes(resume_content)

    files = {"file": ("rohan_patel_resume.pdf", pdf_bytes, "application/pdf")}
    data = {
        "target_role_id": "sde",
        "cgpa": "8.2",
        "project_count": "2",
        "internship_count": "1"
    }

    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["target_role_title"] == "Software Development Engineer (SDE)"
    assert "Data Structures and Algorithms" in res["matched_skills"]
    assert res["readiness_score"] > 60.0
    assert len(res["recommendations"]) > 0

    analysis_id = res["id"]

    # 8. Test Database Persistence and Retrieval
    history_res = client.get("/api/analyses")
    assert history_res.status_code == 200
    items = history_res.json()
    assert any(item["id"] == analysis_id for item in items)

    get_one = client.get(f"/api/analyses/{analysis_id}")
    assert get_one.status_code == 200
    assert get_one.json()["id"] == analysis_id

    # 9. Test Report Export (PDF & CSV)
    pdf_report_res = client.get(f"/api/analyses/{analysis_id}/report?format=pdf")
    assert pdf_report_res.status_code == 200
    assert pdf_report_res.headers["content-type"] == "application/pdf"
    assert len(pdf_report_res.content) > 100

    csv_report_res = client.get(f"/api/analyses/{analysis_id}/report?format=csv")
    assert csv_report_res.status_code == 200
    assert "text/csv" in csv_report_res.headers["content-type"]
    assert b"AI PLACEMENT READINESS PREDICTOR" in csv_report_res.content


# 10. Invalid File Upload & Error Handling Tests
def test_invalid_file_extension(client):
    files = {"file": ("resume.txt", b"Plain text file content", "text/plain")}
    data = {"target_role_id": "data-analyst"}
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_empty_pdf_file(client):
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    data = {"target_role_id": "data-analyst"}
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 400


def test_corrupt_pdf_file(client):
    files = {"file": ("corrupt.pdf", b"%PDF-corrupted-bytes-without-valid-structure", "application/pdf")}
    data = {"target_role_id": "data-analyst"}
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 422


def test_empty_scanned_pdf(client):
    # PDF with pages but no text
    import fitz
    doc = fitz.open()
    doc.new_page()  # blank page
    blank_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("blank_scan.pdf", blank_bytes, "application/pdf")}
    data = {"target_role_id": "data-analyst"}
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 422
    assert "Could not extract readable text" in response.json()["detail"]


def test_resume_upload_with_empty_string_form_fields(client):
    pdf_bytes = create_sample_pdf_bytes(
        "Candidate Resume: Python, SQL, Excel. Completed 2 projects and 1 internship. CGPA: 8.5/10."
    )
    files = {"file": ("resume.pdf", pdf_bytes, "application/pdf")}
    data = {
        "target_role_id": "data-analyst",
        "cgpa": "",
        "project_count": "",
        "internship_count": "",
        "candidate_name": ""
    }
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 200
    data = response.json()
    assert data["target_role_id"] == "data-analyst"
    assert data["readiness_score"] > 0


def test_pdf_with_leading_bytes_header(client):
    valid_pdf = create_sample_pdf_bytes(
        "Student Profile: Python, SQL, Git, React, Docker. CGPA: 9.0/10."
    )
    pdf_with_leading_bytes = b"\r\n\xef\xbb\xbf" + valid_pdf
    files = {"file": ("resume_with_bom.pdf", pdf_with_leading_bytes, "application/pdf")}
    data = {"target_role_id": "software-developer"}
    response = client.post("/api/analyses/analyze-resume", files=files, data=data)
    assert response.status_code == 200


# 11. ML Evaluation Endpoint Test
def test_ml_metrics_endpoint(client):
    response = client.get("/api/ml/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert metrics["accuracy"] >= 0.70
    assert metrics["f1_score"] >= 0.70
    assert len(metrics["confusion_matrix"]) == 2
    assert "disclaimer" in metrics
