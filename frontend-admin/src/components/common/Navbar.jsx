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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Brand & Tag */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm">
            IQ
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">InterviewIQ</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span>Recruiter & Administration Console</span>
        </div>
      </div>

      {/* Right: User Chip & Logout */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900">{user.name}</span>
                <span className="text-[10px] text-slate-500 capitalize flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
