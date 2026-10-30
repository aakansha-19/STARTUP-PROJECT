import React from 'react';
import { GraduationCap, ShieldCheck, Cpu, Code2, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-base">
                AI Placement Readiness Predictor
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              An end-to-end full-stack engineering solution connecting campus talent with tech industry expectations through transparent NLP resume parsing, role skill-gap analysis, and verified learning roadmaps.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" /> FastAPI + PyMuPDF
              </span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" /> React + Vite
              </span>
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-purple-600" /> SQLite + Scikit-Learn
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Target Job Roles
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Data Analyst</li>
              <li>Software Developer</li>
              <li>Data Scientist</li>
              <li>Software Development Engineer (SDE)</li>
            </ul>
          </div>

          {/* Academic Notice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Evaluation Model
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Readiness scores utilize a transparent heuristic formula (50% skills, 20% projects, 15% experience, 15% academics). Machine learning probabilities are powered by a scikit-learn Logistic Regression pipeline.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Transparent & Privacy-First</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} AI Placement Readiness Predictor. Engineering Capstone Project.</p>
          <p>No user resumes are permanently retained on the server.</p>
        </div>
      </div>
    </footer>
  );
}
