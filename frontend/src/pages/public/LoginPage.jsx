import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrainCircuit, Lock, Mail, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password, role);
      success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass, demoRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      const res = await login(demoEmail, demoPass, demoRole);
      success(`Logged in as ${res.user.name}`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    } catch (err) {
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 text-white shadow-xl shadow-indigo-600/25 mb-4 animate-in zoom-in-90 duration-300">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          InterviewAI Platform
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Automated Sentiment Analytics & Technical Competency Evaluation
        </p>

        {searchParams.get('expired') && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            Your previous session expired. Please sign in again.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/90 sm:px-10">
          {/* Role selector tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setRole('admin'); setEmail('admin@interview.ai'); setPassword('Admin@123'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin / Recruiter
            </button>
            <button
              type="button"
              onClick={() => { setRole('candidate'); setEmail('candidate@interview.ai'); setPassword('Candidate@123'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'candidate'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Candidate
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@interview.ai' : 'candidate@interview.ai'}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Admin' : 'Candidate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Instant 1-Click Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@interview.ai', 'Admin@123', 'admin')}
                className="p-2.5 bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/60 rounded-xl transition group"
              >
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <span>Demo Admin</span>
                </div>
                <div className="text-[10px] text-slate-500">Dr. Sarah Jenkins</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('candidate@interview.ai', 'Candidate@123', 'candidate')}
                className="p-2.5 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-xl transition group"
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  <span>Demo Candidate</span>
                </div>
                <div className="text-[10px] text-slate-500">Priya Sharma</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
