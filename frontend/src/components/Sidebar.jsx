import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  GitCompare,
  BarChart3,
  Bot
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      to: '/admin',
      label: 'Analytics Dashboard',
      icon: LayoutDashboard,
      end: true
    },
    {
      to: '/admin/candidates',
      label: 'Candidate Management',
      icon: Users
    },
    {
      to: '/admin/interviews',
      label: 'Interview Sessions',
      icon: ClipboardList
    },
    {
      to: '/admin/compare',
      label: 'Candidate Comparison',
      icon: GitCompare
    }
  ];

  return (
    <aside className="no-print w-64 shrink-0 bg-white border-r border-slate-200 hidden md:flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Recruitment Suite
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* AI Engine Status Info in Sidebar */}
      <div className="mt-auto p-4 m-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>Evaluation Engine</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          Automated scoring: 70% Technical Competency + 30% Sentiment Polarity.
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Pipeline Active
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
