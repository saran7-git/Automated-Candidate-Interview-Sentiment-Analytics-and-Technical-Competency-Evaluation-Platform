import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlayCircle,
  History,
  LineChart,
  FileText,
  User,
  Settings,
  Users,
  Briefcase,
  HelpCircle,
  PieChart,
  BarChart2,
  Heart,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-glow-blue'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800/80 flex flex-col flex-shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-glow-blue group-hover:scale-105 transition-transform">
            IQ
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight leading-none">
              Interview<span className="text-blue-500">IQ</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
              HR Tech SaaS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Dashboard Link */}
        <div>
          <NavLink
            to={isAdmin ? '/admin/dashboard' : '/candidate/dashboard'}
            end
            className={navItemClass}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Candidate Menu */}
        {!isAdmin ? (
          <>
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                INTERVIEW
              </p>
              <div className="space-y-1">
                <NavLink to="/candidate/interview/setup" className={navItemClass}>
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Interview</span>
                </NavLink>
                <NavLink to="/candidate/interviews" className={navItemClass}>
                  <History className="w-4 h-4" />
                  <span>My Interviews</span>
                </NavLink>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ANALYTICS
              </p>
              <div className="space-y-1">
                <NavLink to="/candidate/performance" className={navItemClass}>
                  <LineChart className="w-4 h-4" />
                  <span>Performance</span>
                </NavLink>
                <NavLink to="/candidate/interviews" className={navItemClass}>
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </NavLink>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ACCOUNT
              </p>
              <div className="space-y-1">
                <NavLink to="/candidate/dashboard" className={navItemClass}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </NavLink>
                <NavLink to="/candidate/dashboard" className={navItemClass}>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </NavLink>
              </div>
            </div>
          </>
        ) : (
          /* Admin Menu */
          <>
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                RECRUITMENT
              </p>
              <div className="space-y-1">
                <NavLink to="/admin/candidates" className={navItemClass}>
                  <Users className="w-4 h-4" />
                  <span>Candidates</span>
                </NavLink>
                <NavLink to="/admin/interviews" className={navItemClass}>
                  <Briefcase className="w-4 h-4" />
                  <span>Interviews</span>
                </NavLink>
                <NavLink to="/admin/questions" className={navItemClass}>
                  <HelpCircle className="w-4 h-4" />
                  <span>Questions</span>
                </NavLink>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ANALYTICS
              </p>
              <div className="space-y-1">
                <NavLink to="/admin/analytics" className={navItemClass}>
                  <BarChart2 className="w-4 h-4" />
                  <span>Overview</span>
                </NavLink>
                <NavLink to="/admin/analytics" className={navItemClass}>
                  <LineChart className="w-4 h-4" />
                  <span>Performance</span>
                </NavLink>
                <NavLink to="/admin/analytics" className={navItemClass}>
                  <Heart className="w-4 h-4" />
                  <span>Sentiment</span>
                </NavLink>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                SYSTEM
              </p>
              <div className="space-y-1">
                <NavLink to="/admin/dashboard" className={navItemClass}>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </NavLink>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Role Footer Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 capitalize">{user?.role} Portal</span>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
            PRO
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
