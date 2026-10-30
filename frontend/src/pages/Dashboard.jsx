import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  Download,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchAnalyses, fetchRoles, getReportDownloadUrl } from '../services/api';

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [historyData, rolesData] = await Promise.all([
          fetchAnalyses(10).catch(() => []),
          fetchRoles().catch(() => [])
        ]);
        setAnalyses(historyData);
        setRoles(rolesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Student Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Placement Readiness Dashboard
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Evaluate your technical resume against target industry profiles, track progress, and close skill gaps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze New Resume</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading your readiness dashboard...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Latest Score */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Score</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-blue-600">
                    {latestAnalysis ? `${latestAnalysis.readiness_score}` : '--'}
                  </span>
                  <span className="text-sm text-slate-400 font-medium">/ 100</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Readiness Level:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-md ${
                  latestAnalysis?.readiness_score >= 80
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : latestAnalysis?.readiness_score >= 60
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {latestAnalysis?.readiness_level || 'No Data'}
                </span>
              </div>
            </div>

            {/* Metric 2: Skill Match Percentage */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Match %</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-indigo-600">
                    {latestAnalysis ? `${latestAnalysis.skill_match_percentage}%` : '--'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600">Target Role:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                  {latestAnalysis?.target_role_title || 'None Selected'}
                </span>
              </div>
            </div>

            {/* Metric 3: Candidate & File Profile */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Evaluated</span>
                <div className="text-lg font-bold text-slate-900 mt-2 truncate">
                  {latestAnalysis?.candidate_name || 'Guest Student'}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {latestAnalysis?.filename || 'No resume submitted'}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Analyses:</span>
                <span className="font-bold text-slate-800">{analyses.length}</span>
              </div>
            </div>

            {/* Metric 4: Next Recommended Step */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Action Recommended</span>
                </div>
                <p className="text-xs font-medium text-slate-700 mt-2 line-clamp-2">
                  {latestAnalysis
                    ? `Close missing core required skills for ${latestAnalysis.target_role_title}`
                    : 'Upload your first resume to generate a customized learning roadmap.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60">
                {latestAnalysis ? (
                  <Link
                    to={`/results/${latestAnalysis.id}`}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Full Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/analyze"
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Start Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Target Roles Explorer */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Explore Target Job Roles</h2>
                <p className="text-xs text-slate-500">Compare required vs preferred skill distributions</p>
              </div>
              <Link to="/roles" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <span>View all role details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.short_description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      {r.required_skills_count} Required
                    </span>
                    <Link
                      to={`/analyze?role=${r.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Target Role →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Analysis History Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Resume Analyses</h2>
                <p className="text-xs text-slate-500">History of analyzed resumes and scores</p>
              </div>
              <Link
                to="/analyze"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Upload Another</span>
                <PlusCircle className="w-3.5 h-3.5" />
              </Link>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No resumes analyzed yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload your PDF resume to start tracking your skill matches and placement scores.
                </p>
                <Link
                  to="/analyze"
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  Upload First Resume
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Candidate / File</th>
                      <th className="px-4 py-3">Target Role</th>
                      <th className="px-4 py-3">Readiness Score</th>
                      <th className="px-4 py-3">Skill Match</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {analyses.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{item.candidate_name || 'Candidate'}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{item.filename}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium border border-slate-200">
                            {item.target_role_title}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{item.readiness_score}/100</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              item.readiness_score >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.readiness_score >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.readiness_level}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden inline-block align-middle mr-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, item.skill_match_percentage)}%` }}
                            ></div>
                          </div>
                          <span>{item.skill_match_percentage}%</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {item.created_at ? item.created_at.slice(0, 10) : 'Recent'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Link
                            to={`/results/${item.id}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Link>
                          <a
                            href={getReportDownloadUrl(item.id, 'pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-slate-500 hover:text-slate-800 font-semibold"
                            title="Download PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
