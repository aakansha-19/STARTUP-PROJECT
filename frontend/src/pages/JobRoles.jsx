import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Code2,
  FolderGit2,
  ArrowRight,
  TrendingUp,
  Sliders,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { fetchRoles, fetchRole } from '../services/api';

export default function JobRoles() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);

  useEffect(() => {
    fetchRoles()
      .then((data) => {
        setRoles(data);
        if (data.length > 0) {
          loadRoleDetail(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load roles:', err))
      .finally(() => setLoading(false));
  }, []);

  const loadRoleDetail = async (roleId) => {
    try {
      setRoleDetailLoading(true);
      const detail = await fetchRole(roleId);
      setSelectedRole(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setRoleDetailLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Role Curriculum</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Industry Job Roles & Requirements
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Explore transparent skill expectations, weights, and recommended projects curated for 4 key engineering career paths.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Loading role catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Role Selector Tabs */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Select Career Path
            </h2>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => loadRoleDetail(r.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/10 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <h3 className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {r.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {r.short_description}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.required_skills_count} Required
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {r.preferred_skills_count} Preferred
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Role Requirements */}
          <div className="lg:col-span-8">
            {roleDetailLoading || !selectedRole ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Loading role details...</p>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{selectedRole.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                      {selectedRole.overview}
                    </p>
                  </div>
                  <Link
                    to={`/analyze?role=${selectedRole.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors shrink-0"
                  >
                    <span>Target This Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Required vs Preferred Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Required Core Skills */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-rose-600" />
                        <span>Required Skills (Core)</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        High Weight
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedRole.required_skills?.map((skill) => {
                        const weight = selectedRole.skill_weights?.[skill] || 1.0;
                        return (
                          <div
                            key={skill}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800"
                          >
                            <span>{skill}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Weight: {weight}x
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Preferred Skills</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Competitive Edge
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedRole.preferred_skills?.map((skill) => {
                        const weight = selectedRole.skill_weights?.[skill] || 0.5;
                        return (
                          <div
                            key={skill}
                            className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800"
                          >
                            <span>{skill}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Weight: {weight}x
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Example Projects */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      High-Impact Portfolio Project Examples
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedRole.example_projects?.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">{proj.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                          {proj.recommended_skills?.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-white text-[10px] font-medium text-slate-600 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
