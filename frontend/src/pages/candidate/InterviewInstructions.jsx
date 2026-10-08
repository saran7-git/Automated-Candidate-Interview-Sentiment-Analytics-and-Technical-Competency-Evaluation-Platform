import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI, interviewAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import MediaSystemCheck from '../../components/MediaSystemCheck';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  HelpCircle,
  ShieldCheck,
  CheckCircle,
  Play,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Camera,
  Mic,
  Lock,
  Calculator,
  BookOpen,
  Brain,
  Code2,
  HeartHandshake
} from 'lucide-react';

const InterviewInstructions = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { error, info } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await sessionAPI.getById(sessionId);
        let sess = res.session;
        if (!sess.interview) {
          const allIntr = await interviewAPI.getAll();
          if (allIntr.interviews && allIntr.interviews.length > 0) {
            sess = { ...sess, interview: allIntr.interviews[0] };
          }
        }
        setSession(sess);
      } catch (err) {
        console.error('Session fetch notice:', err.message);
        try {
          const allIntr = await interviewAPI.getAll();
          if (allIntr.interviews && allIntr.interviews.length > 0) {
            setSession({
              id: sessionId,
              interview: allIntr.interviews[0],
              status: 'pending'
            });
          } else {
            error(err.message || 'Failed to load interview instructions');
          }
        } catch (fbErr) {
          error(err.message || 'Failed to load interview instructions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleStart = async () => {
    if (!isMediaReady) {
      info('Please complete the camera and microphone verification or bypass before starting.');
      return;
    }

    try {
      setStarting(true);
      await sessionAPI.startSession(sessionId).catch(err => console.warn('Start session notice:', err.message));
      navigate(`/candidate/interview/${sessionId}`);
    } catch (err) {
      error(err.message || 'Failed to initialize interview');
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading 2026 Foundation Assessment instructions..." />;
  }

  // Fallback default interview details if not yet linked
  const interview = session?.interview || {
    title: '2026 Foundation Assessment + Coding & AI HR Round',
    jobRole: 'Software Engineer (2026 Campus & Foundation Hiring)',
    duration: 75,
    difficulty: 'Intermediate'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link
        to="/candidate"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Portal</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Official 2026 Foundation Pattern (20 + 25 + 20)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <Mic className="w-3 h-3" />
              AI Proctored Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {interview.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Target Job Role: <span className="font-semibold text-slate-800">{interview.jobRole}</span>
          </p>
        </div>

        {/* 2026 Foundation Structure Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Foundation Section Structure
          </h3>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase">Section</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Questions</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase">Time Limit</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase">Key Focus Topics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" /> 1. Numerical Ability
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-600">20 Q</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-600">25 min</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    Percentages, Ratio & Proportion, Profit & Loss, Averages, Time & Work, Time/Speed/Distance, Number System, LCM/HCF, Probability, Permutation & Combination, Mixtures, Data Interpretation
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> 2. Verbal Ability
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">25 Q</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-600">25 min</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    Sentence completion, Grammar, Vocabulary, Reading comprehension, Sentence correction, Para/sentence arrangement
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-600" /> 3. Reasoning Ability
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-amber-600">20 Q</td>
                  <td className="px-4 py-3 text-center font-medium text-slate-600">25 min</td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    Number/letter series, Coding-decoding, Blood relations, Syllogisms, Directions, Seating arrangement, Data arrangement, Logical reasoning, Puzzles
                  </td>
                </tr>
                <tr className="bg-slate-50/80 font-bold">
                  <td className="px-4 py-3 text-slate-900">Total Foundation</td>
                  <td className="px-4 py-3 text-center text-slate-900">65 Q</td>
                  <td className="px-4 py-3 text-center text-slate-900">75 min</td>
                  <td className="px-4 py-3 text-slate-600 text-[11px]">Standard 20 + 25 + 20 Pattern with Per-Student Shuffling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Coding & Personal AI HR Round Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-800 text-xs">
              <Code2 className="w-4 h-4 text-emerald-600" /> 4. Coding Assessment
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Algorithmic problem-solving with live code sandbox editor and instant test case execution across JavaScript, Python, Java, and C++.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-xs">
              <HeartHandshake className="w-4 h-4 text-rose-600" /> 5. Conversational Personal AI HR Round
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Interactive voice & text dialogue. The AI HR interviewer speaks with you, listens to your answers, and dynamically replies with intelligent counter-questions to evaluate communication, attitude, attire, and grooming.
            </p>
          </div>
        </div>

        {/* Camera & Microphone System Check Card */}
        <MediaSystemCheck onVerified={setIsMediaReady} isVerified={isMediaReady} />

        {/* Strict Zero-Tolerance Proctoring Rules */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Strict Anti-Malpractice Proctoring Rules
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>10-STRIKE MALPRACTICE LIMIT:</strong> A unified counter tracks integrity infractions. If total malpractice attempts exceed <strong>10 attempts</strong>, the test is stopped immediately and you will be disqualified.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>10-Second Continuous Eye Gaze Tracking:</strong> Keep your gaze directed at the screen. If eyes are turned away from the screen continuously for <strong>10 seconds</strong>, a malpractice warning strike is triggered.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Fullscreen Warning for 10 Tab Switches:</strong> Fullscreen mode is strictly monitored. Switching tabs displays an overlay warning (maximum 10 allowed).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Session Recording & Presence Evaluation:</strong> The interview session audio & video are recorded and stored for recruiter verification. The AI analyzes communication clarity, emotional composure, attire, and professional grooming.
              </span>
            </li>
          </ul>
        </div>

        {/* Start button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Question Generator & Shuffle Seed Prepared</span>
          </div>
          <button
            onClick={handleStart}
            disabled={starting || !isMediaReady}
            className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98] ${
              isMediaReady
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-slate-400 cursor-not-allowed shadow-none'
            } disabled:opacity-60`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {starting
                ? 'Starting 2026 Foundation Assessment...'
                : isMediaReady
                ? 'Begin 2026 Foundation Assessment'
                : 'Complete Camera & Mic Check Above'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewInstructions;
