import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  FileSearch,
  Briefcase,
  BookOpen,
  BrainCircuit,
  Menu,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchHealth } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Resume', path: '/analyze', icon: FileSearch },
    { name: 'Job Roles', path: '/roles', icon: Briefcase },
    { name: 'Recommendations', path: '/recommendations', icon: BookOpen },
    { name: 'ML Insights', path: '/ml', icon: BrainCircuit },
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                AI Placement Predictor
              </span>
              <span className="hidden sm:block text-xs text-slate-500 font-medium">
                Readiness & Skill-Gap Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status Indicator & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {/* API Status Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
              {apiOnline === null ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              ) : apiOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">API Ready</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600 font-medium">API Offline</span>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
