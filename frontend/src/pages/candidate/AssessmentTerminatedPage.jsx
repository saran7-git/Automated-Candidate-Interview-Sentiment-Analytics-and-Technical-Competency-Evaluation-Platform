import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertTriangle, ShieldAlert, XCircle, ArrowRight, Lock, EyeOff, Ban } from 'lucide-react';

const AssessmentTerminatedPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await sessionAPI.getById(sessionId);
        setSession(res.session);
      } catch (err) {
        console.error('Failed to load disqualified session details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <LoadingSpinner message="Loading assessment security audit report..." />;
  }

  const violationReason = session?.malpracticeReason || 'Proctoring integrity violation detected during assessment';
  const terminatedTime = session?.disqualifiedAt || session?.completedAt || new Date().toISOString();

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-200/90 shadow-xl shadow-rose-200/40 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <Ban className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wider">
            Assessment Terminated & Disqualified
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Proctoring Integrity Violation Detected
          </h1>
          <p className="mt-2 text-sm text-rose-600 max-w-md mx-auto font-medium">
            This interview session was automatically locked and terminated due to an active security infraction.
          </p>
        </div>

        {/* Security Audit Incident Card */}
        <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200/80 text-left space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs border-b border-rose-100 pb-2">
            <span className="font-semibold text-slate-600">Incident Code:</span>
            <span className="font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200 text-[11px]">
              {sessionId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-rose-100 pb-2">
            <span className="font-semibold text-slate-600">Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Disqualified (0/100)
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <span className="font-semibold text-slate-600 block">Reported Infraction:</span>
            <div className="p-3 bg-white rounded-xl border border-rose-200 text-slate-800 font-medium text-xs leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{violationReason}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-slate-600">Timestamp:</span>
            <span className="text-slate-700 font-mono text-[11px]">
              {new Date(terminatedTime).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Policy Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left flex items-start gap-3 max-w-md mx-auto">
          <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Recruiter Audit Policy:</span> All recorded camera frames, window blur events, and timestamps have been logged to the hiring team's audit dossier. This assessment cannot be restarted without explicit administrator clearance.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link
            to="/candidate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition active:scale-[0.98]"
          >
            <span>Return to Candidate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTerminatedPage;
