import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogOut, User, ShieldCheck, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link
            to={isAdmin ? '/admin' : '/candidate'}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent leading-none">
                InterviewAI
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wide uppercase mt-0.5">
                Sentiment & Competency Analytics
              </div>
            </div>
          </Link>

          {/* User profile & Action */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 capitalize">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-0.5 text-indigo-600 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Admin / Recruiter
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                        <Award className="w-3 h-3" /> Candidate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
