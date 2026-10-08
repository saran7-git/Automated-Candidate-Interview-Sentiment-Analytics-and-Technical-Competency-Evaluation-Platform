import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../../api/client';
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
  Lock
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
        setSession(res.session);
      } catch (err) {
        error(err.message || 'Failed to load interview instructions');
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
      await sessionAPI.startSession(sessionId);
      navigate(`/candidate/interview/${sessionId}`);
    } catch (err) {
      error(err.message || 'Failed to initialize interview');
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading interview instructions..." />;
  }

  if (!session || !session.interview) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Interview details not found.</p>
        <Link to="/candidate" className="mt-3 inline-block text-xs font-semibold text-indigo-600">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const interview = session.interview;
  const questionsCount = (interview.questions || []).length;

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
              {interview.difficulty || 'Intermediate'} Level Assessment
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <Mic className="w-3 h-3" />
              Proctored Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {interview.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Target Job Role: <span className="font-semibold text-slate-800">{interview.jobRole}</span>
          </p>
          {interview.description && (
            <p className="mt-2 text-xs text-slate-500">{interview.description}</p>
          )}
        </div>

        {/* Key Info Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-[11px] font-medium text-slate-500">Time Limit</div>
              <div className="text-sm font-bold text-slate-800">{interview.duration || 30} Minutes</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Questions</div>
              <div className="text-sm font-bold text-slate-800">{questionsCount} Questions</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-[11px] font-medium text-slate-500">Scoring Engine</div>
              <div className="text-sm font-bold text-slate-800">70% Tech + 30% Tone</div>
            </div>
          </div>
        </div>

        {/* Camera & Microphone System Check Card */}
        <MediaSystemCheck onVerified={setIsMediaReady} isVerified={isMediaReady} />

        {/* 6 Rounds Assessment Suite Overview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            6-Round Assessment Structure
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-indigo-700">1. MCQ Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Computer science & engineering core concepts</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-blue-700">2. Technical Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Architecture, databases & system design</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-amber-700">3. Aptitude Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Quantitative logic & analytical reasoning</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-emerald-700">4. Coding Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Interactive code IDE with test runner sandbox</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-purple-700">5. Communication Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Incident verbal briefing via microphone</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-rose-700">6. HR Final AI Round</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Behavioral EQ & culture alignment</div>
            </div>
          </div>
        </div>

        {/* Candidate Rules & Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Zero-Tolerance Automated Proctoring Rules
          </h3>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>IMMEDIATE TERMINATION FOR MALPRACTICE:</strong> If you move out of camera frame, look away/avert your eye gaze from the assessment screen, or switch browser tabs, the AI proctoring monitor triggers an automatic countdown and <strong>terminates your assessment right away</strong> with instant disqualification.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Continuous Gaze Focus:</strong> Keep your eyes centered on the screen. Avoid glancing at notes, secondary devices, or looking around your room.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Voice Dictation & Coding IDE:</strong> You can dictate spoken answers in Round 5 using your microphone and test execution algorithms in Round 4 using the built-in test runner.
              </span>
            </li>
          </ul>
        </div>

        {/* Start button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Encrypted Proctoring Stream Active</span>
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
                ? 'Initializing Proctored Session...'
                : isMediaReady
                ? 'Begin Proctored Assessment'
                : 'Complete Camera & Mic Check Above'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewInstructions;
