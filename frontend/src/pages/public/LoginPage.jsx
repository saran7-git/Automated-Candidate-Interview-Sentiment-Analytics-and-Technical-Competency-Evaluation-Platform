import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrainCircuit, Lock, Mail, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'saved_interview_credentials';

const LoginPage = () => {
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load user-saved credentials on mount or role change if previously saved
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setHasSavedCredentials(true);
        if (saved[role]) {
          setEmail(saved[role].email || '');
          setPassword(saved[role].password || '');
          return;
        }
      }
      setEmail('');
      setPassword('');
    } catch (e) {
      console.warn('Could not load saved credentials:', e);
    }
  }, [role]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved[newRole]) {
          setEmail(saved[newRole].email || '');
          setPassword(saved[newRole].password || '');
          return;
        }
      }
      setEmail('');
      setPassword('');
    } catch (e) {
      setEmail('');
      setPassword('');
    }
  };

  const handleClearSaved = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedCredentials(false);
      setEmail('');
      setPassword('');
      info('Cleared saved credentials from this browser.');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);

      // Save credentials if rememberMe is enabled
      if (rememberMe) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const saved = raw ? JSON.parse(raw) : {};
          saved[role] = { email, password, role, savedAt: new Date().toISOString() };
          saved.lastRole = role;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          setHasSavedCredentials(true);
        } catch (err) {
          console.warn('Could not save credentials to storage:', err);
        }
      }

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
          2026 Foundation Assessment & Technical Evaluation
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
              onClick={() => handleRoleChange('candidate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'candidate'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin / Recruiter
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
                  placeholder="name@domain.com"
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

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                />
                <span>Remember credentials</span>
              </label>
              {hasSavedCredentials && (
                <button
                  type="button"
                  onClick={handleClearSaved}
                  className="text-[11px] text-slate-400 hover:text-rose-600 underline"
                >
                  Clear saved
                </button>
              )}
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
                  <span>Sign In as {role === 'admin' ? 'Admin / Recruiter' : 'Candidate'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Create New Candidate Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
