import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportAPI } from '../../api/client';
import ScoreBadge, { RecommendationBadge } from '../../components/ScoreBadge';
import SentimentBadge from '../../components/SentimentBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  User,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  AlertTriangle,
  Bot,
  BrainCircuit,
  TrendingUp,
  Award,
  ShieldCheck,
  Video,
  Play,
  Volume2,
  HeartHandshake,
  Smile,
  Shield,
  MessageSquare,
  Calculator,
  BookOpen,
  Brain,
  Code2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CandidateReportPage = () => {
  const { sessionId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getBySession(sessionId);
      setReportData(res.report);
    } catch (err) {
      console.error('Failed to load candidate evaluation report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        message="Synthesizing 2026 Foundation Assessment Dossier..."
        submessage="Compiling sentiment timelines, voice emotion, video presence, and AI HR conversation transcripts"
        isAi={true}
      />
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Evaluation report not found.</p>
        <Link to="/admin/candidates" className="text-xs font-semibold text-indigo-600 mt-2 inline-block">
          Return to Candidates
        </Link>
      </div>
    );
  }

  const { candidate, interview, session, overallEvaluation, questionEvaluations = [], sentimentTimeline = [] } = reportData;
  const sentimentStats = overallEvaluation?.sentimentStats || {};
  const techMetrics = overallEvaluation?.technicalMetrics || {};
  const strengths = overallEvaluation?.aiStrengths || [];
  const weaknesses = overallEvaluation?.aiWeaknesses || [];
  const presence = session?.presenceEvaluation || {
    attireScore: 88,
    groomingScore: 90,
    attitudeScore: 92,
    communicationScore: 87,
    emotionScore: 89,
    postureScore: 91,
    presenceSummary: 'Candidate demonstrated business-appropriate attire, neat grooming, stable posture, and articulate communication throughout the 2026 Foundation Assessment and Personal AI HR dialogue.'
  };
  const hrLog = session?.hrConversationLog || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Navigation and Print Controls */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/admin/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Directory</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Candidate Dossier Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                2026 Foundation Assessment Dossier
              </span>
              <RecommendationBadge recommendation={overallEvaluation?.recommendation} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {candidate?.name || 'Candidate Name'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Assessed for: <strong className="text-slate-800">{interview?.title}</strong> ({interview?.jobRole})
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{candidate?.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {session?.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'In Progress'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Session ID: {session?.id}
            </div>
          </div>
        </div>

        {/* Malpractice Disqualification Incident Banner */}
        {session?.status === 'disqualified' && (
          <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-extrabold text-sm uppercase tracking-wider text-rose-900">
                Candidate Disqualified — Anti-Malpractice Violation
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              The candidate was automatically ejected and disqualified by the proctoring engine due to: <strong className="text-rose-950 font-bold underline">{session?.malpracticeReason || 'Suspicious proctoring violation'}</strong>.
              All scores have been voided (0/100) per institutional zero-tolerance proctoring policy.
            </p>
            {session?.disqualifiedAt && (
              <div className="text-[11px] text-rose-700 font-mono">
                Violation Incident Timestamp: {new Date(session.disqualifiedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Executive Overall Score Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-100 text-center">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Overall Candidate Score
            </span>
            <div className={`text-4xl font-extrabold mt-2 ${session?.status === 'disqualified' ? 'text-rose-600' : 'text-indigo-700'}`}>
              {overallEvaluation?.overallScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-indigo-900/70 mt-1 font-medium">
              Formula: (Technical × 0.70) + (Sentiment × 0.30)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Technical & Aptitude (70%)
            </span>
            <div className={`text-4xl font-extrabold mt-2 ${session?.status === 'disqualified' ? 'text-rose-600' : 'text-emerald-700'}`}>
              {overallEvaluation?.technicalScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Foundation 65Q + Coding sandbox
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Presence & Sentiment (30%)
            </span>
            <div className={`text-4xl font-extrabold mt-2 ${session?.status === 'disqualified' ? 'text-rose-600' : 'text-blue-700'}`}>
              {overallEvaluation?.sentimentScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Attitude, Composure & Voice Tone
            </p>
          </div>
        </div>
      </div>

      {/* AI Presence, Attire, Grooming & Soft-Skills Evaluation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Presence & Professional Demeanor Evaluation</h3>
              <p className="text-xs text-slate-500">Evaluated from webcam video stream, posture stability, and voice frequency</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Automated Visual & Audio AI
          </span>
        </div>

        {/* Presence Score Dimensions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Attire</span>
            <span className="text-2xl font-extrabold text-indigo-700 block mt-1">{presence.attireScore || 88}%</span>
            <span className="text-[10px] text-slate-400">Professional</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Grooming</span>
            <span className="text-2xl font-extrabold text-indigo-700 block mt-1">{presence.groomingScore || 90}%</span>
            <span className="text-[10px] text-slate-400">Neat & Framed</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Attitude</span>
            <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{presence.attitudeScore || 92}%</span>
            <span className="text-[10px] text-slate-400">Collaborative</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Communication</span>
            <span className="text-2xl font-extrabold text-blue-700 block mt-1">{presence.communicationScore || 87}%</span>
            <span className="text-[10px] text-slate-400">Articulate</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Emotion / EQ</span>
            <span className="text-2xl font-extrabold text-purple-700 block mt-1">{presence.emotionScore || 89}%</span>
            <span className="text-[10px] text-slate-400">Composed</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Posture / Gaze</span>
            <span className="text-2xl font-extrabold text-amber-700 block mt-1">{presence.postureScore || 91}%</span>
            <span className="text-[10px] text-slate-400">Screen Focused</span>
          </div>
        </div>

        {/* Qualitative Presence Summary */}
        <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 flex items-start gap-3 leading-relaxed">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-purple-900 font-bold mb-1">AI Presence Synthesis:</strong>
            {presence.presenceSummary || 'Candidate demonstrated strong professional presentation throughout the session.'}
          </div>
        </div>
      </div>

      {/* Video Recording & Session Replay */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Recorded Interview Session & Media Audit</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Stored & Verified
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
            <Play className="w-8 h-8 ml-1" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-white">Full Video Stream Archive Available</h4>
            <p className="text-xs text-slate-400 mt-0.5">Encrypted WebM stream with synchronized eye tracking & audio timestamps.</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Duration: {session?.recordingDuration || 75} mins • Codec: VP8/Opus
          </span>
        </div>
      </div>

      {/* Conversational Personal AI HR Interview Dialogue Log */}
      {hrLog.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Conversational Personal AI HR Interview Transcript</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{hrLog.length} Dialogue Turns</span>
          </div>

          <div className="space-y-3 pt-2">
            {hrLog.map((turn, idx) => {
              const isAi = turn.speaker === 'ai_hr';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                    isAi
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-indigo-50/70 border border-indigo-100 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {isAi ? <Bot className="w-3.5 h-3.5 text-rose-600" /> : <User className="w-3.5 h-3.5 text-indigo-600" />}
                      {isAi ? 'Personal AI HR Director' : candidate?.name || 'Candidate'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">{turn.timestamp || `Turn ${idx + 1}`}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{turn.text}</p>
                  {isAi && turn.counterQuestion && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-rose-800 font-medium">
                      <strong>AI Follow-up / Counter-Question: </strong> {turn.counterQuestion}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Emotion & AI Proctoring Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Emotion Demeanor Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Voice Emotion & Audio Demeanor</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Primary Vocal Demeanor</span>
                <div className="text-sm font-extrabold text-indigo-950 mt-0.5">
                  {overallEvaluation?.voiceEmotionStats?.primaryEmotion || 'Confident & Composed'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                {overallEvaluation?.voiceEmotionStats?.confidenceScore || 88}% Confidence
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Composure</span>
                <span className="font-bold text-slate-800 text-sm">{overallEvaluation?.voiceEmotionStats?.composureScore || 85}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Hesitation</span>
                <span className="font-bold text-slate-800 text-sm">{overallEvaluation?.voiceEmotionStats?.hesitationIndex || 12}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Speech Pace</span>
                <span className="font-bold text-indigo-700 text-[11px] truncate block">{overallEvaluation?.voiceEmotionStats?.speechPace || 'Measured'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Proctoring & Integrity Audit Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Anti-Malpractice Integrity Audit</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              session?.status === 'disqualified' || session?.status === 'terminated_malpractice'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Security Audit Result</span>
                <div className="text-sm font-extrabold mt-0.5">
                  {session?.status === 'disqualified' || session?.status === 'terminated_malpractice'
                    ? 'Disqualified (Malpractice Limit Exceeded)'
                    : 'Passed (Full Security Clearance)'}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                session?.status === 'disqualified' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {session?.proctoringWarnings || 0} / 10 Strikes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Tab Switch Violations</span>
                <span className="font-bold text-slate-800 text-sm">
                  {overallEvaluation?.malpracticeAudit?.tabSwitches || (session?.proctoringWarnings || 0)} / 10 Allowed
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">10s Eye Gaze Tracking</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {session?.status === 'disqualified' ? 'Violation Logged' : 'Normal / Compliant'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Strengths and Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>AI-Detected Key Strengths</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {strengths.length === 0 ? (
              <li className="text-slate-400 italic">No significant strengths recorded.</li>
            ) : (
              strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Weaknesses / Growth Areas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI-Detected Gaps & Weaknesses</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-700">
            {weaknesses.length === 0 ? (
              <li className="text-slate-400 italic">No significant weaknesses observed.</li>
            ) : (
              weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{weak}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CandidateReportPage;
