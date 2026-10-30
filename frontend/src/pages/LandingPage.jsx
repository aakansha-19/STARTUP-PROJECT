import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Compass,
  Code,
  LineChart,
  Server,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Resume',
      desc: 'Upload your standard PDF resume or paste text directly. Our PyMuPDF and NLP pipeline extracts technical skills, education, projects, and experience.',
      icon: FileText,
      accent: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      step: '02',
      title: 'Target Role Skill-Gap Analysis',
      desc: 'Select your target job role. The engine cross-references your profile against transparent industry requirements to identify matched and missing competencies.',
      icon: Target,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      step: '03',
      title: 'Score & Actionable Roadmap',
      desc: 'Receive an honest 0–100 readiness score, resume formatting improvements, and a prioritized learning curriculum with verified real-world course links.',
      icon: TrendingUp,
      accent: 'text-purple-600 bg-purple-50 border-purple-200'
    }
  ];

  const roles = [
    {
      title: 'Data Analyst',
      desc: 'SQL, Python, Power BI, Excel, Data Visualization & Business Analytics.',
      icon: LineChart,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Software Developer',
      desc: 'JavaScript, Python, React, REST APIs, Git & Modern Web Development.',
      icon: Code,
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Data Scientist',
      desc: 'Machine Learning, Statistics, Pandas, NumPy, Predictive Modeling & SQL.',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Software Development Engineer (SDE)',
      desc: 'Data Structures & Algorithms, Java/C++, System Design & Scalable APIs.',
      icon: Server,
      color: 'from-violet-600 to-purple-600'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Placement Readiness Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            AI Placement Readiness <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Predictor</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bridging campus engineering education with industry expectations. Get transparent skill-gap analysis, honest readiness scoring, and a personalized learning roadmap.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:shadow-blue-500/35 group"
            >
              <span>Analyze Your Resume</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Compass className="w-4 h-4 mr-2 text-slate-500" />
              <span>Explore 4 Job Roles</span>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">4 Roles</div>
              <div className="text-xs text-slate-500 mt-1">Curated Tech Profiles</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">0–100</div>
              <div className="text-xs text-slate-500 mt-1">Transparent Score</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">NLP Powered</div>
              <div className="text-xs text-slate-500 mt-1">PyMuPDF Resume Parsing</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">100% Real</div>
              <div className="text-xs text-slate-500 mt-1">Verified Course Links</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className="p-8 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">The Problem</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-4">
                The Campus-to-Corporate Skill Gap
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                College students frequently submit resumes without knowing whether their skills align with specific role requirements. Typical campus preparation lacks:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Clarity on required core skills versus optional preferred skills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Objective feedback on project portfolios, internships, and quantifiable metrics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Direction on which exact skills to learn first when facing limited preparation time.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">The Solution</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-4">
                Transparent Evaluation & Actionable Roadmaps
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Our application removes guesswork with an automated engineering pipeline designed for genuine student empowerment:
              </p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><b>Accurate PDF Extraction:</b> Uses PyMuPDF and token boundary matching across 20+ technical competencies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><b>Transparent Scoring:</b> 50% skill match, 20% projects, 15% experience, and 15% academics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><b>Actionable Guidance:</b> Prioritized course catalog with genuine verified URLs from Coursera, freeCodeCamp, and Kaggle.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Workflow</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">How It Works in 3 Simple Steps</h2>
          <p className="text-slate-600 text-sm mt-2">
            From raw resume to customized preparation roadmap in under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${s.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200 group-hover:text-blue-200 transition-colors">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Roles Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Role Library</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">4 Industry Tech Profiles</h2>
          <p className="text-slate-600 text-sm mt-2">
            Curated role requirements tailored for fresh graduates and early-career software professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${r.color} text-white flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{r.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to="/roles"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View role requirements</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 text-center shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold max-w-xl mx-auto">
            Ready to test your placement readiness?
          </h2>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-md mx-auto">
            Upload your resume now for an instant skill-gap audit and download your personalized report.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/analyze"
              className="px-8 py-3.5 rounded-xl bg-white text-blue-800 font-bold shadow-lg hover:bg-blue-50 transition-colors"
            >
              Analyze Resume Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
