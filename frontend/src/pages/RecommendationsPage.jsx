import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Filter,
  GraduationCap,
  Clock,
  Layers
} from 'lucide-react';
import { fetchRoles, fetchRoleRecommendations } from '../services/api';

export default function RecommendationsPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('data-analyst');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRoles()
      .then((data) => {
        setRoles(data);
        if (data.length > 0) {
          setSelectedRole(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    fetchRoleRecommendations(selectedRole)
      .then((data) => setRecommendations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const filteredRecommendations = recommendations.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.skill.toLowerCase().includes(q) ||
      rec.course_name.toLowerCase().includes(q) ||
      rec.provider.toLowerCase().includes(q) ||
      rec.project_idea.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Curated Learning Directory</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Role-Based Learning Recommendations
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Curated courses with real, verified links from Coursera, freeCodeCamp, Kaggle, and official documentation paired with concrete project prompts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === r.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, courses, projects..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading verified course recommendations...</p>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No matching recommendations found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting another job role.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((rec) => (
            <div
              key={rec.skill}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                    Priority #{rec.priority}: {rec.skill}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.importance === 'Required'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rec.importance}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {rec.course_name}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Provider: <b className="text-slate-800">{rec.provider}</b></span>
                  <span>~{rec.estimated_weeks} wks</span>
                </div>

                {/* Key topics badges */}
                {rec.key_topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rec.key_topics.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Practical Project Idea */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Portfolio Project Idea:</span>
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{rec.project_idea}</p>
                </div>
              </div>

              {/* Direct Link Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={rec.course_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {rec.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
