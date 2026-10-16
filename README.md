# AI Placement Readiness Predictor

An end-to-end full-stack web application that bridges campus engineering education with tech industry requirements. Built with a modern **React + Vite** frontend, a high-performance **FastAPI** backend, **PyMuPDF** resume text extraction, **NLP** skill-gap analysis, an **honest heuristic readiness scoring engine**, and a **scikit-learn Logistic Regression** pipeline.

---

## 1. Project Architecture & Overview

```
Startup-project/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry point, CORS, startup lifespan
│   │   ├── database.py              # SQLAlchemy engine, session maker, SQLite connection
│   │   ├── models.py                # AnalysisRecord database model
│   │   ├── schemas.py               # Pydantic schemas for requests, responses & ML metrics
│   │   ├── routes/
│   │   │   ├── health.py            # GET /api/health
│   │   │   ├── roles.py             # GET /api/roles, GET /api/roles/{role_id}
│   │   │   ├── analysis.py          # POST /api/analyses/analyze-resume, POST /api/analyses/analyze, GET /api/analyses
│   │   │   ├── recommendations.py   # GET /api/recommendations/{role_id}
│   │   │   └── ml.py                # GET /api/ml/metrics, POST /api/ml/retrain
│   │   ├── services/
│   │   │   ├── pdf_extractor.py     # PyMuPDF (fitz) text parser with corruption/scan handling
│   │   │   ├── skill_extractor.py   # NLP token-boundary & phrase matcher (with spaCy fallback)
│   │   │   ├── readiness_engine.py  # 50/20/15/15 transparent heuristic calculation & gap analysis
│   │   │   ├── recommendation_engine.py # Maps missing skills to verified courses & project ideas
│   │   │   └── report_generator.py  # PDF (ReportLab) & CSV report generators
│   │   ├── ml/
│   │   │   ├── trainer.py           # Synthetic benchmark dataset generator & LogisticRegression pipeline
│   │   │   ├── predictor.py         # Model loader, probability estimator & feature scaler
│   │   │   ├── placement_model.joblib # Serialized trained pipeline
│   │   │   └── model_metrics.json   # Held-out test split evaluation metrics
│   │   └── data/
│   │       ├── roles.json           # 4 Curated job roles with weights & project samples
│   │       ├── skills_dictionary.json # Configurable skill aliases & categories
│   │       ├── courses_catalog.json # Verified real-world course links (Coursera, freeCodeCamp, etc.)
│   │       └── synthetic_training_data.csv # Synthetic benchmark dataset (N=600)
│   ├── tests/
│   │   └── test_api.py              # Pytest test suite (14 automated integration & unit tests)
│   ├── requirements.txt             # Python backend dependencies
│   ├── pytest.ini                   # Pytest configuration
│   └── .env.example                 # Backend environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive header with live API status indicator
│   │   │   └── Footer.jsx           # Footer with technical stack & integrity disclaimers
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Product value prop, 3-step workflow & role preview
│   │   │   ├── Dashboard.jsx        # Student metrics, role explorer & analysis history
│   │   │   ├── ResumeAnalyzer.jsx   # Drag-and-drop PDF uploader, validation & manual overrides
│   │   │   ├── AnalysisResults.jsx  # Recharts breakdown, radar chart, matched/missing skills, PDF/CSV export
│   │   │   ├── JobRoles.jsx         # Detailed curriculum for all 4 roles
│   │   │   ├── RecommendationsPage.jsx # Searchable & filterable directory of verified courses
│   │   │   └── MLInsightsPage.jsx   # Model architecture, confusion matrix & coefficients
│   │   ├── services/
│   │   │   └── api.js               # Frontend API client with Vite proxy integration
│   │   ├── App.jsx                  # React Router page routing
│   │   ├── index.css                # Tailwind base, utilities & typography
│   │   └── main.jsx                 # React root renderer
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Vite config with local /api proxy to FastAPI
│   ├── tailwind.config.js           # Professional slate/navy theme configuration
│   ├── postcss.config.js            # PostCSS plugin setup
│   ├── vercel.json                  # Vercel SPA routing rewrite rules
│   └── .env.example                 # Frontend environment variable template
├── render.yaml                      # Render backend cloud deployment specification
├── .gitignore                       # Ignored venvs, node_modules, build outputs, and databases
└── README.md                        # Documentation and setup guide
```

---

## 2. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router v6, Recharts, Lucide React (JavaScript only, no TypeScript).
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLite database, SQLAlchemy ORM, Pydantic v2.
- **NLP & Resume Extraction**: PyMuPDF (`fitz`) for resilient PDF parsing, token-boundary phrase matching with configurable `skills_dictionary.json`, graceful spaCy fallback.
- **Machine Learning**: scikit-learn (`Pipeline`, `StandardScaler`, `LogisticRegression`), pandas, NumPy, joblib.
- **Report Generation**: ReportLab (structured PDF reports with styled tables) & Python `csv` module.
- **Testing**: `pytest`, FastAPI `TestClient`, HTTP isolation via in-memory SQLite with `StaticPool`.

---

## 3. Supported Job Roles

1. **Data Analyst**: SQL, Python, Excel, Power BI, Data Visualization, Statistics (Preferred: Tableau, Pandas, NumPy, Git, REST APIs).
2. **Software Developer**: JavaScript, Python, HTML, CSS, Git, REST APIs, SQL (Preferred: React, FastAPI, Django, Flask, DSA).
3. **Data Scientist**: Python, Machine Learning, Statistics, Pandas, NumPy, SQL (Preferred: Data Visualization, Git, FastAPI, Excel, DSA).
4. **Software Development Engineer (SDE)**: Data Structures & Algorithms, Java, C++, Python, SQL, Git, REST APIs (Preferred: FastAPI, JavaScript, React, HTML, CSS).

---

## 4. Transparent Scoring & ML Methodology

### A. Transparent Heuristic Readiness Score (0 to 100)
- **50% Skill Match Contribution**: Evaluates matched required skills (weighted 1.0–1.6) and preferred skills (weighted 0.5–0.9) against total role weight.
- **20% Practical Projects Contribution**: Bounded based on completed projects (0 pts for 0, 8 pts for 1, 15 pts for 2, 20 pts for 3+).
- **15% Industry Internships Contribution**: Practical workplace experience (0 pts for 0, 10 pts for 1, 15 pts for 2+).
- **15% Academic Standing Contribution**: Normalized CGPA on a 10.0 scale (a 7.0 standard baseline is applied with clear notice if omitted).
- **Readiness Levels**:
  - $\ge 80$: *High Readiness*
  - $60 - 79.9$: *Moderate Readiness*
  - $< 60$: *Needs Preparation*

### B. Supervised Placement Probability Model (scikit-learn)
- Architecture: `StandardScaler` + `LogisticRegression(class_weight='balanced')`.
- Features: `cgpa`, `relevant_skill_count`, `project_count`, `internship_count`, `skill_match_percentage`.
- **Integrity Disclosure**: The model is trained and evaluated strictly on an **80/20 train/test split of a synthetic benchmark dataset (N=600)**. It demonstrates machine learning pipeline engineering, feature scaling, model persistence, and evaluation metrics (accuracy, precision, recall, F1-score, confusion matrix) without claiming to possess real-world student hiring outcomes.

---

## 5. Local Setup & Running (Windows Step-by-Step)

### Prerequisites
- Python 3.10, 3.11, 3.12, 3.13, or 3.14 installed.
- Node.js (v18+) and npm installed.

---

### Step A: Backend Setup

Open PowerShell in the project root:

```powershell
# 1. Navigate to the project root
cd Startup-project

# 2. Create the Python virtual environment
python -m venv backend\venv

# 3. Activate the virtual environment
backend\venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install -r backend\requirements.txt

# 5. Run the automated pytest suite (14 tests)
pytest backend\tests\test_api.py -v

# 6. Start the FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend --reload
```

Backend will be live at:
- **API URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

### Step B: Frontend Setup

Open a second PowerShell window:

```powershell
# 1. Navigate to the frontend directory
cd Startup-project\frontend

# 2. Install Node dependencies
npm install

# 3. Run production build test (optional verification)
npm run build

# 4. Start the Vite development server
npm run dev
```

Frontend will be live at:
- **Application URL**: `http://localhost:5173/`

*(The Vite dev server automatically proxies all `/api` calls to `http://127.0.0.1:8000`)*.

---

## 6. Key REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status, database type, and NLP/ML engine state |
| `GET` | `/api/roles` | Lists the 4 curated technical job roles with summary metrics |
| `GET` | `/api/roles/{role_id}` | Detailed requirements, skill weights, and project ideas |
| `POST` | `/api/analyses/analyze-resume` | Uploads PDF resume (`multipart/form-data`) and runs analysis |
| `POST` | `/api/analyses/analyze` | Evaluates raw resume text (`application/json`) |
| `GET` | `/api/analyses` | Retrieves history of student analyses from SQLite |
| `GET` | `/api/analyses/{analysis_id}` | Complete analysis details, scores, and recommendations |
| `GET` | `/api/analyses/{analysis_id}/report` | Downloads analysis report (`?format=pdf` or `?format=csv`) |
| `GET` | `/api/recommendations/{role_id}` | Role-specific course and project recommendations |
| `GET` | `/api/ml/metrics` | Model accuracy, precision, recall, F1, and confusion matrix |
| `POST` | `/api/ml/retrain` | Retrains Logistic Regression model on benchmark data |

---

## 7. Cloud Deployment Guide

### A. Backend Deployment on Render
1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your Git repository.
3. Set the following settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
4. Add environment variables:
   - `CORS_ORIGINS`: `https://your-frontend-app.vercel.app,http://localhost:5173`
   - `DATABASE_URL`: `sqlite:///./app/placement_predictor.db`
5. Alternatively, deploy using the included `render.yaml` blueprint.

> **Important Note on SQLite in Cloud Hosting:**
> SQLite stores data in a local file. On free hosting tiers (such as Render free web services), the local filesystem is ephemeral and resets during service restarts. For production persistence with large user bases, mount a persistent volume on Render or update `DATABASE_URL` in `backend/app/database.py` to point to a managed PostgreSQL database (e.g. Supabase or Neon).

### B. Frontend Deployment on Vercel
1. Import your Git repository into [Vercel](https://vercel.com).
2. Select the **Root Directory** as `frontend`.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
5. Deploy. The included `frontend/vercel.json` ensures all client routes (`/dashboard`, `/analyze`, `/results/:id`) resolve smoothly via SPA rewrites.

---

## 8. Automated Test Results

Running `pytest backend/tests/test_api.py -v`:

```
tests/test_api.py::test_health_check PASSED                      [  7%]
tests/test_api.py::test_get_roles PASSED                         [ 14%]
tests/test_api.py::test_get_single_role_detail PASSED            [ 21%]
tests/test_api.py::test_get_invalid_role PASSED                  [ 28%]
tests/test_api.py::test_skill_extractor_accuracy PASSED          [ 35%]
tests/test_api.py::test_readiness_engine_gap_and_score PASSED    [ 42%]
tests/test_api.py::test_recommendation_engine PASSED             [ 50%]
tests/test_api.py::test_analyze_manual_text_endpoint PASSED      [ 57%]
tests/test_api.py::test_analyze_valid_pdf_resume PASSED          [ 64%]
tests/test_api.py::test_invalid_file_extension PASSED            [ 71%]
tests/test_api.py::test_empty_pdf_file PASSED                    [ 78%]
tests/test_api.py::test_corrupt_pdf_file PASSED                  [ 85%]
tests/test_api.py::test_empty_scanned_pdf PASSED                 [ 92%]
tests/test_api.py::test_ml_metrics_endpoint PASSED               [100%]

======================= 14 passed in 59.37s ========================
```

---

## 9. Limitations & Future Roadmap

- **Scanned Resumes**: Current optical extraction expects text-based PDF resumes. Scanned image-only PDFs return a helpful prompt advising the student to use a text-based document or paste text directly. Integrating OCR (Tesseract / AWS Textract) can expand support to scanned images.
- **Institutional Calibration**: The current placement probability model runs on a synthetic benchmark dataset. Partnering with a university placement cell would allow calibration using anonymized historical placement records.
- **Additional Roles**: The modular architecture allows adding new engineering or domain roles simply by adding entries to `backend/app/data/roles.json`.
