import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-between p-6">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-glow-blue">
            IQ
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Interview<span className="text-blue-500">IQ</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back to Platform
        </Link>
      </header>

      {/* Main Form Slot */}
      <div className="flex-1 flex items-center justify-center py-10">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-4 border-t border-slate-800/60">
        © 2026 InterviewIQ Platform. All rights reserved. Automated Candidate Interview Sentiment Analytics & Technical Evaluation.
      </footer>
    </div>
  );
};

export default AuthLayout;
