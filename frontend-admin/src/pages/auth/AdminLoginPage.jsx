import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertCircle, ArrowRight, Lock, CheckCircle2, UserCheck } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'admin' && user.role !== 'recruiter') {
        setError('Access denied: This portal is restricted to Administrator & Recruiter accounts.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid recruiter or administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role !== 'admin' && user.role !== 'recruiter') {
        setError('Access denied: Recruiter or Admin role required.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm shadow-sm">
            IQ
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
              Interview<span className="text-teal-600">IQ</span>
            </span>
            <span className="text-[10px] text-teal-700 font-bold tracking-wider uppercase mt-0.5">
              Recruiter & Admin Console
            </span>
          </div>
        </div>

        <a
          href="http://localhost:3000"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
        >
          <span>← Candidate Portal (Port 3000)</span>
        </a>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 mx-auto flex items-center justify-center text-teal-700 shadow-2xs mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter & Admin Sign In</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Automated Candidate Interview Sentiment Analytics & Technical Competency Portal
            </p>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center mb-2.5">
              1-Click Demo Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@example.com', 'admin123')}
                className="py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('recruiter@example.com', 'recruiter123')}
                className="py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Recruiter Demo</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com or recruiter@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Recruiter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-4 border-t border-slate-200">
        © 2026 InterviewIQ Recruitment Assessment Platform. Role-based authorized access only.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
