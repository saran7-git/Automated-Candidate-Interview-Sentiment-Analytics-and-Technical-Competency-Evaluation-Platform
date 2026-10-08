import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CheckCircle2, ShieldCheck, ArrowRight, FileCheck, Bot, Clock } from 'lucide-react';

const InterviewCompletionPage = () => {
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
        console.error('Failed to load session details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <LoadingSpinner message="Verifying interview submission status..." />;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Interview Submitted Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Thank you for completing your interview!
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Your technical responses and communication answers have been securely logged in the system.
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-2.5 max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Session ID:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              {sessionId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Interview:</span>
            <span className="font-medium text-slate-800">
              {session?.interview?.title || 'Technical Assessment'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Completion Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Completed
            </span>
          </div>

          {session?.completedAt && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Submitted At:</span>
              <span className="text-slate-700">
                {new Date(session.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Security & Recruiter Policy Notice */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-left flex items-start gap-3 max-w-md mx-auto">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 leading-relaxed">
            <span className="font-bold">Automated Evaluation Notice:</span> Your responses are automatically analyzed using NLP sentiment classification and technical competency matching. Detailed recruiter-only analytics are preserved for the hiring review panel.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Link
            to="/candidate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition active:scale-[0.98]"
          >
            <span>Return to Candidate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompletionPage;
