import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HelpCircle,
  BarChart2,
  Settings,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-teal-600 text-white shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
    }`;

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-sm group-hover:scale-105 transition-transform">
            IQ
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight leading-none">
              Interview<span className="text-teal-400">IQ</span>
            </span>
            <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase mt-0.5">
              Admin & Recruiter
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Console Links */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            OVERVIEW
          </p>
          <div className="space-y-1">
            <NavLink to="/dashboard" end className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/analytics" className={navItemClass}>
              <BarChart2 className="w-4 h-4" />
              <span>Cohort Analytics & Trends</span>
            </NavLink>
          </div>
        </div>

        {/* Recruitment Management */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            RECRUITMENT EVALUATION
          </p>
          <div className="space-y-1">
            <NavLink to="/candidates" className={navItemClass}>
              <Users className="w-4 h-4" />
              <span>Candidates Directory</span>
            </NavLink>
            <NavLink to="/interviews" className={navItemClass}>
              <Briefcase className="w-4 h-4" />
              <span>Interview Submissions</span>
            </NavLink>
            <NavLink to="/questions" className={navItemClass}>
              <HelpCircle className="w-4 h-4" />
              <span>Question Bank (40+)</span>
            </NavLink>
          </div>
        </div>

        {/* Portal Switcher */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            SWITCH PORTAL
          </p>
          <a
            href="http://localhost:3000"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              Candidate App (Port 3000)
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Role Footer Badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              {user?.role === 'recruiter' ? 'Recruiter' : 'Administrator'}
            </span>
          </div>
          <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-md">
            AUTHORIZED
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
