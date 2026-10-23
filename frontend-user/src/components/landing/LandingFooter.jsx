import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
  return (
    <footer id="about" className="border-t border-slate-800/80 bg-[#0f172a] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-glow-blue">
            IQ
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">
            Interview<span className="text-blue-500">IQ</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center md:text-left">
          © 2026 InterviewIQ. Smarter Interviews. Better Decisions.
        </p>

        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
          <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-white transition-colors">Candidate Portal</Link>
          <Link to="/login" className="hover:text-white transition-colors">Admin Console</Link>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
