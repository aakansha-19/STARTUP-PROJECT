import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const AnalysisResults = lazy(() => import('./pages/AnalysisResults'));
const JobRoles = lazy(() => import('./pages/JobRoles'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const MLInsightsPage = lazy(() => import('./pages/MLInsightsPage'));

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" role="status">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analyze" element={<ResumeAnalyzer />} />
            <Route path="/results/:id" element={<AnalysisResults />} />
            <Route path="/roles" element={<JobRoles />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/ml" element={<MLInsightsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
