import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sessionAPI, candidateAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import ScoreBadge from '../../components/ScoreBadge';
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      if (user?.candidateId) {
        const res = await sessionAPI.getByCandidate(user.candidateId);
        setSessions(res.sessions || []);
      } else {
        // Fallback: search candidates by email or user ID
        const candRes = await candidateAPI.getAll();
        const me = candRes.candidates?.find(
          (c) => c.email?.toLowerCase() === user?.email?.toLowerCase()
        );
        if (me && me.id) {
          const res = await sessionAPI.getByCandidate(me.id);
          setSessions(res.sessions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load candidate sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your interview portal..." />;
  }

  const completed = sessions.filter((s) => s.status === 'completed');
  const pending = sessions.filter((s) => s.status !== 'completed');
  const latestCompleted = completed[0] || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" /> Candidate Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            Welcome to the automated technical evaluation system. View your assigned interviews, complete technical assessments, and track submission statuses.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Sessions
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{sessions.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{completed.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending / In Progress
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{pending.length}</div>
          </div>
        </div>
      </div>

      {/* Latest Evaluation Summary if completed */}
      {latestCompleted?.report && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Latest Assessment Result
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {latestCompleted.interviewTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Status: Completed & Analyzed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs font-semibold text-slate-500">Overall Score</div>
              <div className="text-3xl font-extrabold text-indigo-700 mt-1">
                {latestCompleted.report.overallScore}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                (70% Technical + 30% Sentiment)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs font-semibold text-slate-500">Technical Score</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                {latestCompleted.report.technicalScore}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Technical Competency</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs font-semibold text-slate-500">Sentiment Score</div>
              <div className="text-3xl font-extrabold text-blue-700 mt-1">
                {latestCompleted.report.sentimentScore}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Communication Polarity</div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Evaluation Note: </span>
              {latestCompleted.report.summary ||
                'Your interview responses have been analyzed by the AI pipeline. Full hiring decisions will be audited by the talent team.'}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Interviews List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Your Interview Sessions</h3>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm">No interviews currently assigned to your account.</p>
            <p className="text-xs text-slate-400 mt-1">
              Please contact the recruitment team to assign an interview template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => {
              const isCompleted = sess.status === 'completed';
              const isInProgress = sess.status === 'in_progress';
              const sessId = sess._id || sess.id;

              return (
                <div
                  key={sessId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-200 hover:shadow-md transition-all gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        {sess.interviewTitle}
                      </span>
                      {isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Completed
                        </span>
                      ) : isInProgress ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Role: {sess.jobRole}</span>
                      <span>•</span>
                      <span>{sess.totalQuestions} Questions</span>
                      <span>•</span>
                      <span>Duration: {sess.duration} mins</span>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <Link
                        to={`/candidate/complete/${sessId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Status Dossier</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/candidate/instructions/${sessId}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition"
                      >
                        <Play className="w-4 h-4" />
                        <span>{isInProgress ? 'Resume Interview' : 'Start Interview'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
