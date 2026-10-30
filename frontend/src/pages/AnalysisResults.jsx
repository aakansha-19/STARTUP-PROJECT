import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  FileText,
  RotateCcw,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { fetchAnalysis, getReportDownloadUrl } from '../services/api';

export default function AnalysisResults() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-bold text-slate-800">Compiling Evaluation Results...</h2>
        <p className="text-xs text-slate-500 mt-1">Retrieving persistent analysis #{id}</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analysis Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'Unable to load analysis report.'}</p>
        <Link
          to="/analyze"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Analyze a Resume
        </Link>
      </div>
    );
  }

  // Breakdown chart data
  const breakdown = analysis.score_breakdown || {};
  const breakdownChartData = [
    { name: 'Skill Match', earned: breakdown.skill_match_score || 0, max: breakdown.skill_match_max || 50, fill: '#2563EB' },
    { name: 'Projects', earned: breakdown.projects_score || 0, max: breakdown.projects_max || 20, fill: '#4F46E5' },
    { name: 'Internships', earned: breakdown.internships_score || 0, max: breakdown.internships_max || 15, fill: '#7C3AED' },
    { name: 'Academics', earned: breakdown.academics_score || 0, max: breakdown.academics_max || 15, fill: '#0EA5E9' },
  ];

  // Radar chart comparing student vs role ideal
  const radarData = [
    { subject: 'Core Skills', candidate: Math.min(100, Math.max(0, analysis.skill_match_percentage || 0)), roleExpectation: 95 },
    { subject: 'Projects', candidate: Math.min(100, Math.max(0, ((breakdown.projects_score || 0) / 20) * 100)), roleExpectation: 85 },
    { subject: 'Experience', candidate: Math.min(100, Math.max(0, ((breakdown.internships_score || 0) / 15) * 100)), roleExpectation: 75 },
    { subject: 'Academics', candidate: Math.min(100, Math.max(0, ((breakdown.academics_score || 0) / 15) * 100)), roleExpectation: 80 },
    { subject: 'Completeness', candidate: Math.min(100, Math.max(0, analysis.readiness_score || 0)), roleExpectation: 90 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Evaluation Report #{analysis.id}</span>
            <span>•</span>
            <span>{analysis.created_at ? analysis.created_at.slice(0, 10) : 'Recent'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {analysis.candidate_name}'s Readiness Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Target Job Role: <span className="font-semibold text-slate-800">{analysis.target_role_title}</span> • Resume File: <span className="font-mono text-slate-600">{analysis.filename}</span>
          </p>
        </div>

        {/* Report Download and New Analysis Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={getReportDownloadUrl(analysis.id, 'pdf')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </a>
          <a
            href={getReportDownloadUrl(analysis.id, 'csv')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>Download CSV</span>
          </a>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze Another</span>
          </Link>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Readiness Score */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-blue-600">
                {analysis.readiness_score}
              </span>
              <span className="text-base text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Classification:</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              analysis.readiness_score >= 80
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : analysis.readiness_score >= 60
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {analysis.readiness_level}
            </span>
          </div>
        </div>

        {/* Metric 2: Skill Match Percentage */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Skill Match</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-indigo-600">
                {analysis.skill_match_percentage}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{analysis.matched_skills?.length || 0} Matched</span>
            <span>{analysis.missing_skills?.length || 0} Skills Needed</span>
          </div>
        </div>

        {/* Metric 3: Practical Experience */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Indicators</span>
            <div className="mt-2 space-y-1">
              <div className="text-sm font-bold text-slate-800">
                {analysis.project_count} Completed Projects
              </div>
              <div className="text-xs text-slate-600">
                {analysis.internship_count} Industry Internships
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated CGPA:</span>
            <span className="font-bold text-slate-800">{analysis.cgpa ? `${analysis.cgpa}/10` : '7.0 (Baseline)'}</span>
          </div>
        </div>

        {/* Metric 4: ML Placement Probability Benchmark */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/70 to-blue-50/70 border border-indigo-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              <span>ML Probability</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-purple-700">
                {analysis.ml_placement_probability !== null ? `${analysis.ml_placement_probability}%` : 'N/A'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-200/60">
            <span className="text-[10px] text-slate-600 block leading-tight">
              Statistical benchmark estimate via Logistic Regression.
            </span>
          </div>
        </div>
      </div>

      {/* Honest Scoring Transparency Card */}
      <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Transparent Heuristic Scoring Methodology</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          The <b>Readiness Score</b> is calculated deterministically:
          <b> 50% Skill Match</b> (required skills weighted 1.0–1.6, preferred weighted 0.5–0.9) +
          <b> 20% Relevant Projects</b> (scaled based on 1–3+ completed projects) +
          <b> 15% Internship Experience</b> (practical workplace exposure) +
          <b> 15% Academic Standing</b> (normalized CGPA on 10-point scale).
        </p>
        <p className="text-[11px] text-slate-500 italic">
          Institutional notice: Labeled as a heuristic preparation score until validated against your college's historical placement records.
        </p>
      </div>

      {/* Charts Section: Factor Breakdown & Radar Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Factor Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Score Factor Breakdown</h3>
            <p className="text-xs text-slate-500">Points earned vs maximum available weight</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownChartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} / ${item.payload.max} pts`, 'Score']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="earned" radius={[0, 6, 6, 0]}>
                  {breakdownChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Profile Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Competency Comparison Radar</h3>
            <p className="text-xs text-slate-500">Candidate profile (%) vs Industry expectation benchmark</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Candidate" dataKey="candidate" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.5} />
                <Radar name="Industry Benchmark" dataKey="roleExpectation" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.2} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Analysis: Matched vs Missing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matched Skills */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Matched Skills ({analysis.matched_skills?.length || 0})
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified in Resume
            </span>
          </div>

          {analysis.matched_skills?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No overlapping skills detected for this role.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {analysis.matched_skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills Sorted by Priority */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Missing Skills to Learn ({analysis.missing_skills?.length || 0})
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Ranked by Importance
            </span>
          </div>

          {analysis.missing_skills?.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              🎉 Outstanding! You satisfy all required and preferred skills for {analysis.target_role_title}.
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.missing_skills?.map((item) => (
                <div
                  key={item.skill}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {item.learning_priority}
                    </span>
                    <span className="font-bold text-slate-900">{item.skill}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                    item.importance === 'Required'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.importance}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personalized Learning Roadmaps with Real Links */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Curated Action Plan</span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Personalized Course & Project Recommendations
          </h2>
          <p className="text-xs text-slate-500">
            Hand-picked courses with authentic verified links and practical project ideas to bridge your gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analysis.recommendations?.map((rec) => (
            <div
              key={rec.skill}
              className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/60 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                    Priority #{rec.priority}: {rec.skill}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {rec.difficulty} • ~{rec.estimated_weeks} wks
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {rec.course_name}
                </h4>

                <div className="text-xs text-slate-500 font-medium">
                  Offered by: <span className="text-slate-800 font-semibold">{rec.provider}</span>
                </div>

                {/* Practical Project Prompt */}
                <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Recommended Project:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed">{rec.project_idea}</p>
                </div>
              </div>

              {/* Course link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={rec.course_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Go to Course ({rec.provider})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {rec.alternate_resource && (
                  <a
                    href={rec.alternate_resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                  >
                    Alternative Resource
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Resume Improvement Checklist */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">Resume Improvement Plan</h3>
        </div>
        <div className="space-y-3">
          {analysis.improvement_suggestions?.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
