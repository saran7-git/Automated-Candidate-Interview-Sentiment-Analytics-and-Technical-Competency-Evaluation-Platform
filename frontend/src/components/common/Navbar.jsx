import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Sparkles, Shield, Cpu } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Brand & Tag */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-glow-blue">
            IQ
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">InterviewIQ</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Interview Analytics v2.0</span>
        </div>
      </div>

      {/* Right: User Chip & Logout */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  {isAdmin ? <Shield className="w-2.5 h-2.5 text-blue-400" /> : <UserIcon className="w-2.5 h-2.5 text-slate-400" />}
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-colors shadow-glow-blue"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
