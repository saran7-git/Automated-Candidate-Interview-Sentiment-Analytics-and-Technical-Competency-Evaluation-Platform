import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LandingNavbar = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-glow-blue">
            IQ
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-tight">
              Interview<span className="text-blue-500">IQ</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              AI HR TECH SAAS
            </span>
          </div>
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>

        {/* Right: Auth buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={isAdmin ? '/admin/dashboard' : '/candidate/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue"
            >
              Go to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue"
              >
                Get Started
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
