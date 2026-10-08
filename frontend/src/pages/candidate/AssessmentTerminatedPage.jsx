import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { sessionAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  ArrowRight,
  EyeOff,
  UserX,
  FileX2,
  Lock
} from 'lucide-react';

const AssessmentTerminatedPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read violation passed via navigation state if available
  const passedReason = location.state?.reason;
  const passedViolation = location.state?.violationType;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await sessionAPI.getById(sessionId);
        setSession(res.session);
      } catch (err) {
        console.warn('Failed to load session details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const reason =
    passedReason ||
    session?.malpracticeReason ||
    'Proctoring integrity violation detected (out of camera frame, eye gaze averted, or unauthorized window blur).';

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-white rounded-3xl p-7 sm:p-9 border-2 border-rose-300 shadow-2xl shadow-rose-600/10 space-y-6 text-center">
        {/* Pulsing Disqualification Shield Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 shadow-xl shadow-rose-600/20 mx-auto">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            Zero-Tolerance Malpractice Disqualification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
            Assessment Terminated Immediately
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Your assessment session was terminated right away by the automated AI proctoring monitor due to an uncorrected integrity violation.
          </p>
        </div>

        {/* Violation Incident Report Card */}
        <div className="bg-rose-50/80 rounded-2xl p-5 border border-rose-200/90 text-left space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Infraction Incident Report</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 shrink-0">Violation Cause:</span>
              <span className="font-bold text-rose-800 text-right">{reason}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Session ID:</span>
              <span className="font-mono text-slate-700 text-[11px] font-semibold">{sessionId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Enforcement Policy:</span>
              <span className="font-semibold text-rose-700">Immediate Assessment Lockout</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full text-[11px]">
                Disqualified (Score: 0)
              </span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          In strict accordance with assessment guidelines, moving out of camera frame, averting your gaze away from the screen, or navigating outside the browser window results in immediate termination. All proctoring telemetry has been forwarded to the recruiter.
        </p>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            to="/candidate"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-md active:scale-95"
          >
            <span>Return to Candidate Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTerminatedPage;
