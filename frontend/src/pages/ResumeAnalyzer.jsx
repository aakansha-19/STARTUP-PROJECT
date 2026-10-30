import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCode,
  Sliders,
  Briefcase
} from 'lucide-react';
import { fetchRoles, analyzeResumeFile, analyzeResumeText } from '../services/api';

const DEFAULT_FALLBACK_ROLES = [
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    short_description: 'Extracts insights from structured data, creates business dashboards, and informs strategic decisions through statistical exploration.'
  },
  {
    id: 'software-developer',
    title: 'Software Developer',
    short_description: 'Designs, writes, tests, and maintains modern web and enterprise software applications across frontend and backend systems.'
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    short_description: 'Builds statistical models, machine learning algorithms, and predictive systems to solve complex business challenges.'
  },
  {
    id: 'sde',
    title: 'Software Development Engineer (SDE)',
    short_description: 'Engineers scalable distributed systems, algorithms, performant backend architectures, and core software platforms.'
  }
];

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const [roles, setRoles] = useState(DEFAULT_FALLBACK_ROLES);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'data-analyst');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'

  // File upload state
  const [file, setFile] = useState(null);
  const [fileDragOver, setFileDragOver] = useState(false);

  // Raw text state
  const [resumeText, setResumeText] = useState('');

  // Manual Profile Overrides (Optional)
  const [candidateName, setCandidateName] = useState('');
  const [manualCgpa, setManualCgpa] = useState('');
  const [manualProjects, setManualProjects] = useState('');
  const [manualInternships, setManualInternships] = useState('');
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);

  // Submission & Error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchRoles()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
          if (searchParams.get('role') && data.some((r) => r.id === searchParams.get('role'))) {
            setSelectedRole(searchParams.get('role'));
          } else if (!selectedRole) {
            setSelectedRole(data[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic roles from backend, using default roles catalog:', err);
      });
  }, [searchParams]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    setErrorMessage(null);
    if (!f) return;

    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document (.pdf). Other formats are not supported.');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10 MB limit. Please select a smaller PDF file.');
      return;
    }

    if (f.size === 0) {
      setErrorMessage('The selected PDF file is empty (0 bytes). Please select a valid resume document.');
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFileDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedRole) {
      setErrorMessage('Please select a target job role.');
      return;
    }

    if (activeTab === 'upload') {
      if (!file) {
        setErrorMessage('Please select or drag-and-drop a PDF resume file.');
        return;
      }

      try {
        setIsSubmitting(true);
        setLoadingPhase('Parsing PDF document structure...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_role_id', selectedRole);

        if (candidateName && candidateName.trim()) {
          formData.append('candidate_name', candidateName.trim());
        }

        if (manualCgpa !== '') {
          const parsed = parseFloat(manualCgpa);
          if (!isNaN(parsed)) {
            formData.append('cgpa', Math.min(10.0, Math.max(0.0, parsed)).toString());
          }
        }

        if (manualProjects !== '') {
          const parsed = parseInt(manualProjects, 10);
          if (!isNaN(parsed)) {
            formData.append('project_count', Math.max(0, parsed).toString());
          }
        }

        if (manualInternships !== '') {
          const parsed = parseInt(manualInternships, 10);
          if (!isNaN(parsed)) {
            formData.append('internship_count', Math.max(0, parsed).toString());
          }
        }

        setTimeout(() => setLoadingPhase('Extracting technical skills & profile signals...'), 800);
        setTimeout(() => setLoadingPhase('Analyzing skill gap & computing readiness score...'), 1600);

        const result = await analyzeResumeFile(formData);
        if (!result || !result.id) {
          throw new Error('Received unexpected response format from server.');
        }
        navigate(`/results/${result.id}`);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to analyze resume. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Paste raw text mode
      if (!resumeText.trim() || resumeText.trim().length < 30) {
        setErrorMessage('Please enter at least 30 characters of resume text.');
        return;
      }

      try {
        setIsSubmitting(true);
        setLoadingPhase('Parsing resume text & extracting technical competencies...');

        const parsedCgpa = (manualCgpa !== '' && !isNaN(parseFloat(manualCgpa)))
          ? Math.min(10.0, Math.max(0.0, parseFloat(manualCgpa)))
          : null;

        const parsedProjects = (manualProjects !== '' && !isNaN(parseInt(manualProjects, 10)))
          ? Math.max(0, parseInt(manualProjects, 10))
          : null;

        const parsedInternships = (manualInternships !== '' && !isNaN(parseInt(manualInternships, 10)))
          ? Math.max(0, parseInt(manualInternships, 10))
          : null;

        const payload = {
          resume_text: resumeText.trim(),
          target_role_id: selectedRole,
          candidate_name: candidateName.trim() || 'Candidate',
          cgpa: parsedCgpa,
          project_count: parsedProjects,
          internship_count: parsedInternships,
        };

        const result = await analyzeResumeText(payload);
        if (!result || !result.id) {
          throw new Error('Received unexpected response format from server.');
        }
        navigate(`/results/${result.id}`);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to process resume text.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Analyze Your Resume
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Upload your resume in PDF format to discover matched skills, missing prerequisites, and your placement readiness score.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 p-1 rounded-xl inline-flex text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Upload PDF File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>Paste Resume Text</span>
          </button>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Analysis Error:</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Target Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Target Job Role <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((r) => (
              <label
                key={r.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  selectedRole === r.id
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    value={r.id}
                    checked={selectedRole === r.id}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{r.title}</span>
                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{r.short_description}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 2. File Upload or Paste Area */}
        {activeTab === 'upload' ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Upload Resume (PDF) <span className="text-rose-500">*</span>
            </label>

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setFileDragOver(true);
                }}
                onDragLeave={() => setFileDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  fileDragOver
                    ? 'border-blue-600 bg-blue-50/80 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Click to browse or drag and drop your PDF resume
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Supported format: Text-based PDF (Max file size: 10 MB)
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  <span>Privacy Notice: Resumes are processed in memory and never stored permanently.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • Ready for analysis
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove selected file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste Resume Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here, including skills, projects, education, and internship details..."
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            ></textarea>
            <p className="text-xs text-slate-500">
              Ensure text includes your core programming languages, frameworks, education, and project descriptions.
            </p>
          </div>
        )}

        {/* 3. Advanced / Manual Profile Overrides Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedInputs ? 'Hide' : 'Add / Correct Optional Profile Details (CGPA, Projects)'}</span>
          </button>

          {showAdvancedInputs && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <p className="text-xs text-slate-500">
                Our parser automatically detects these from your resume. You can specify or override them here if your resume has non-standard formatting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    CGPA (10.0 scale)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={manualCgpa}
                    onChange={(e) => setManualCgpa(e.target.value)}
                    placeholder="e.g. 8.5"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Completed Projects
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={manualProjects}
                    onChange={(e) => setManualProjects(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Internships Completed
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={manualInternships}
                    onChange={(e) => setManualInternships(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Clicking analyze triggers the NLP parser, rule-based gap engine, and ML model.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-500/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{loadingPhase || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>Analyze Resume Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
