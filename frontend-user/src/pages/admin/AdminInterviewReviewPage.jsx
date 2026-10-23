import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../../services/api';
import { MediaSyncPlayer } from '../../components/admin/MediaSyncPlayer';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { RecommendationBadge } from '../../components/common/RecommendationBadge';
import { SentimentPieChart } from '../../components/charts/SentimentPieChart';
import {
  ArrowLeft,
  Video,
  Mic,
  Monitor,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  Cpu,
  Smile,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';

export const AdminInterviewReviewPage = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'analytics'

  useEffect(() => {
    const fetchInterviewReview = async () => {
      try {
        const res = await interviewService.getInterviewById(id);
        if (res.data.success) {
          setInterview(res.data.interview);
          setRecordings(res.data.recordings || []);
        }
      } catch (err) {
        console.error('Failed to load interview review data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewReview();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading interview media and evaluation audit...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 text-slate-400 space-y-3">
        <p className="text-base font-bold text-white">Interview session not found.</p>
        <Link to="/admin/interviews" className="text-purple-400 underline text-xs">
          Return to Interviews List
        </Link>
      </div>
    );
  }

  const candidate = interview.candidateId || {};
  const questions = interview.questions || [];
  const answers = interview.answers || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/interviews"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Interviews</span>
        </Link>

        <span className="text-xs font-mono text-slate-500">
          Session ID: {interview._id}
        </span>
      </div>

      {/* Candidate Profile & Score Summary Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-dark-900 via-dark-900 to-purple-950/20 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold text-xl">
              {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white">{candidate.name || 'Candidate'}</h1>
                <span className="text-xs text-slate-400 font-mono">({candidate.email})</span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3">
                <span>Domain: <b className="text-brand-400">{interview.domain}</b></span>
                <span>•</span>
                <span>Difficulty: <b className="text-amber-400">{interview.difficulty}</b></span>
                <span>•</span>
                <span>Date: {new Date(interview.completedAt || interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <div>
            <RecommendationBadge recommendation={interview.recommendation} size="lg" />
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Overall Score</span>
              <div className="text-2xl font-black text-white mt-0.5">{interview.overallScore}%</div>
            </div>
            <ScoreBadge score={interview.overallScore} size="md" />
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Technical Accuracy</span>
              <div className="text-2xl font-black text-teal-400 mt-0.5">{interview.technicalScore}%</div>
            </div>
            <ScoreBadge score={interview.technicalScore} size="md" />
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Communication Polarity</span>
              <div className="text-2xl font-black text-purple-400 mt-0.5">{interview.sentimentScore}%</div>
            </div>
            <ScoreBadge score={interview.sentimentScore} size="md" />
          </div>
        </div>
      </div>

      {/* Synchronized Multi-Media Playback Console ⭐⭐⭐ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">
              Candidate Multi-Channel Recording Console
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {recordings.length} Media Streams Synchronized
          </span>
        </div>

        <MediaSyncPlayer
          recordings={recordings}
          questions={questions}
          answers={answers}
          totalDuration={interview.duration}
        />
      </div>

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(interview.strengths || []).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-amber-950/10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Areas For Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(interview.areasToImprove || []).map((a, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-Wise Evaluation Detail */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          Question Responses & Algorithmic Evaluation
        </h2>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find(
              (a) => (a.questionId?._id || a.questionId)?.toString() === (q.questionId || q._id)?.toString()
            ) || answers[idx];

            const evalData = ans?.evaluation || {};

            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                      Question {idx + 1} • {q.skill || q.domain}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {q.questionText || q.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={evalData.technicalScore || 0} size="md" label="Technical:" />
                  </div>
                </div>

                {/* Candidate Answer Text */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Submitted Answer
                  </span>
                  <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {ans?.textAnswer || (
                      <span className="text-slate-500 italic">No text provided (Candidate gave verbal response).</span>
                    )}
                  </div>
                </div>

                {/* Concepts Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <span className="font-bold text-emerald-400 uppercase text-[10px]">
                      Matched Concepts ({evalData.matchedConcepts?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData.matchedConcepts || []).length > 0 ? (
                        evalData.matchedConcepts.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold"
                          >
                            ✓ {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">
                      Missing Expected Concepts ({evalData.missingConcepts?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData.missingConcepts || []).length > 0 ? (
                        evalData.missingConcepts.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px]"
                          >
                            • {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400">All concepts covered</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Algorithmic Feedback Note */}
                <div className="p-3.5 rounded-xl bg-dark-900/90 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold uppercase text-[10px] text-slate-300">
                      Automated Evaluation Insight
                    </span>
                    <span>Sentiment: <b className="text-purple-400">{evalData.sentiment || 'Neutral'}</b></span>
                  </div>
                  <p className="text-slate-300">{evalData.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
