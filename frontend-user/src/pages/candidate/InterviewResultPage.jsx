import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../../services/api';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { RecommendationBadge } from '../../components/common/RecommendationBadge';
import { SkillRadarChart } from '../../components/charts/SkillRadarChart';
import { SentimentPieChart } from '../../components/charts/SentimentPieChart';
import { MediaSyncPlayer } from '../../components/admin/MediaSyncPlayer';
import {
  Award,
  Cpu,
  Smile,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Video,
  Mic,
  Monitor,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';

export const InterviewResultPage = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0); // expand first by default
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await interviewService.getInterviewById(id);
        if (res.data.success) {
          setInterview(res.data.interview);
          setRecordings(res.data.recordings || []);
        }
      } catch (err) {
        console.error('Failed to load interview results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading evaluation report...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 text-slate-400 space-y-3">
        <p className="text-base font-bold text-white">Evaluation report not found.</p>
        <Link to="/candidate/dashboard" className="text-brand-400 underline text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const questions = interview.questions || [];
  const answers = interview.answers || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/candidate/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="text-xs font-mono text-slate-500">
          Interview ID: {interview._id}
        </span>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-dark-900 via-dark-900 to-brand-950/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Semantic Competency Evaluation Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {interview.domain} Technical Evaluation
            </h1>
            <p className="text-xs text-slate-400">
              Difficulty: <span className="text-slate-200 font-semibold">{interview.difficulty}</span> • Completed on{' '}
              {new Date(interview.completedAt || interview.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div>
            <RecommendationBadge recommendation={interview.recommendation} size="lg" />
          </div>
        </div>

        {/* 3 Core Scores Hero Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Overall Score</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-white">{interview.overallScore}%</span>
              <ScoreBadge score={interview.overallScore} size="md" />
            </div>
            <p className="text-[11px] text-slate-400">
              Weighted: 70% Technical + 30% Communication
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Technical Competency</span>
              <Cpu className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-teal-400">{interview.technicalScore}%</span>
              <ScoreBadge score={interview.technicalScore} size="md" />
            </div>
            <p className="text-[11px] text-slate-400">
              Concept coverage & technical depth
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Communication Insight</span>
              <Smile className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-purple-400">{interview.sentimentScore}%</span>
              <ScoreBadge score={interview.sentimentScore} size="md" />
            </div>
            <p className="text-[11px] text-slate-400">
              Lexicon confidence & clarity polarity
            </p>
          </div>
        </div>
      </div>

      {/* Media Recordings Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Interview Media Recordings</h3>
            <p className="text-xs text-slate-400">
              {recordings.length} synchronized recording streams captured
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMediaPlayer(!showMediaPlayer)}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 border border-slate-700"
        >
          <span>{showMediaPlayer ? 'Hide Media Console' : 'Open Media Playback Console'}</span>
          {showMediaPlayer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Embedded Media Player Console (if opened) */}
      {showMediaPlayer && (
        <div className="p-6 rounded-3xl glass-panel border border-brand-500/30">
          <MediaSyncPlayer
            recordings={recordings}
            questions={questions}
            answers={answers}
            totalDuration={interview.duration}
          />
        </div>
      )}

      {/* Skill Performance & Sentiment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Performance Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Skill Topic Performance</h3>
            <p className="text-xs text-slate-400">Score breakdown per technical competence category</p>
          </div>

          <div className="space-y-3">
            {(interview.skillBreakdown || []).map((sk, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{sk.skill}</span>
                  <span className="text-brand-300 font-bold">{sk.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full"
                    style={{ width: `${sk.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Insight Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Communication & Sentiment Breakdown</h3>
            <p className="text-xs text-slate-400">Rule-based lexicon polarity distribution</p>
          </div>
          <SentimentPieChart data={interview.sentimentDistribution} />
        </div>
      </div>

      {/* Strengths & Areas to Improve Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Strengths Identified</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {(interview.strengths || []).map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-amber-950/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Areas For Technical Improvement</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {(interview.areasToImprove || []).map((area, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Question-by-Question Evaluation Audit
          </h2>
          <span className="text-xs text-slate-400">
            {questions.length} questions evaluated
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find(
              (a) => (a.questionId?._id || a.questionId)?.toString() === (q.questionId || q._id)?.toString()
            ) || answers[idx];

            const evalData = ans?.evaluation || {};
            const isExpanded = expandedQuestion === idx;

            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? -1 : idx)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-dark-900 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-300">
                      Q{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">
                        {q.questionText || q.question}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Skill: {q.skill} • Difficulty: {q.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ScoreBadge score={evalData.technicalScore || 0} size="sm" label="Score:" />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-slate-800/60 space-y-5 text-xs">
                    {/* Candidate Answer */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-400 uppercase tracking-wider">
                        Submitted Answer
                      </label>
                      <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {ans?.textAnswer || (
                          <span className="text-slate-500 italic">No text answer submitted (Candidate spoke verbally).</span>
                        )}
                      </div>
                    </div>

                    {/* Matched Concepts vs Missing Concepts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Matched */}
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">
                          Matched Expected Concepts ({evalData.matchedConcepts?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(evalData.matchedConcepts || []).length > 0 ? (
                            evalData.matchedConcepts.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30"
                              >
                                ✓ {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">None detected</span>
                          )}
                        </div>
                      </div>

                      {/* Missing */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                          Missing Expected Concepts ({evalData.missingConcepts?.length || 0})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(evalData.missingConcepts || []).length > 0 ? (
                            evalData.missingConcepts.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] border border-slate-700"
                              >
                                • {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-400 text-[11px]">All key concepts covered!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback & Sentiment */}
                    <div className="p-4 rounded-xl bg-dark-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                          <span>AI Algorithmic Technical Feedback</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Sentiment: <b className="text-purple-400">{evalData.sentiment || 'Neutral'}</b> ({evalData.sentimentScore || 50}%)
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {evalData.feedback || 'Answer evaluated.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
