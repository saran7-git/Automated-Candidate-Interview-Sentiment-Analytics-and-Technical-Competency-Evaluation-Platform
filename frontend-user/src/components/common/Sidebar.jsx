import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Brain,
  Video,
  PlayCircle,
  History,
  LineChart,
  FileText,
  User,
  Settings,
  ShieldCheck,
  Code2,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-teal-600 text-white shadow-sm font-bold'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
    }`;

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/90">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-sm group-hover:scale-105 transition-transform">
            IQ
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight leading-none">
              Interview<span className="text-teal-400">IQ</span>
            </span>
            <span className="text-[10px] text-teal-400/90 font-bold tracking-wider uppercase mt-0.5">
              Candidate Assessment
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Main Dashboard */}
        <div>
          <NavLink to="/dashboard" end className={navItemClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Timed Assessments Menu */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            TIMED ASSESSMENTS
          </p>
          <div className="space-y-1">
            <NavLink to="/assessments" className={navItemClass}>
              <Brain className="w-4 h-4 text-teal-400" />
              <span>Assessment Hub (5 Modules)</span>
            </NavLink>
            <NavLink to="/assessment/coding" className={navItemClass}>
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Coding Sandbox (60m)</span>
            </NavLink>
          </div>
        </div>

        {/* AI Proctored Interview Menu */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            AI INTERVIEW PORTAL
          </p>
          <div className="space-y-1">
            <NavLink to="/interview/setup" className={navItemClass}>
              <Video className="w-4 h-4" />
              <span>Technical Interview</span>
            </NavLink>
            <NavLink to="/interview/device-check" className={navItemClass}>
              <ShieldCheck className="w-4 h-4" />
              <span>Device & Proctor Check</span>
            </NavLink>
            <NavLink to="/history" className={navItemClass}>
              <History className="w-4 h-4" />
              <span>Interview History</span>
            </NavLink>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            EVALUATION & REPORTS
          </p>
          <div className="space-y-1">
            <NavLink to="/candidate/comprehensive-report" className={navItemClass}>
              <Award className="w-4 h-4 text-amber-400" />
              <span>Comprehensive Scorecard</span>
            </NavLink>
            <NavLink to="/performance" className={navItemClass}>
              <LineChart className="w-4 h-4" />
              <span>Performance Trends</span>
            </NavLink>
          </div>
        </div>

        {/* Portal Switcher */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            SWITCH CONSOLE
          </p>
          <a
            href="http://localhost:3001"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Recruiter Console (3001)
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Footer User Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">{user?.name || 'Candidate'}</span>
              <span className="text-[10px] text-slate-400">Verified Session</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
