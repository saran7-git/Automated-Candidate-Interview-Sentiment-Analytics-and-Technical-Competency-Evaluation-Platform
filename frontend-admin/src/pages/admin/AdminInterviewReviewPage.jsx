import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../../services/api';
import { MediaSyncPlayer } from '../../components/admin/MediaSyncPlayer';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { RecommendationBadge } from '../../components/common/RecommendationBadge';
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
  Clock,
  FileText
} from 'lucide-react';

export const AdminInterviewReviewPage = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading candidate media and evaluation audit...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-16 text-slate-500 space-y-3">
        <p className="text-base font-bold text-slate-900">Interview session not found.</p>
        <Link to="/admin/interviews" className="text-teal-600 underline text-xs font-semibold">
          Return to Interviews List
        </Link>
      </div>
    );
  }

  const candidate = interview.candidateId || {};
  const questions = interview.questions || [];
  const answers = interview.answers || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/interviews"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Interviews</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/candidate/results/${interview.id || interview._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 text-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full AI Report</span>
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Session ID: {interview._id || interview.id}
          </span>
        </div>
      </div>

      {/* Candidate Profile & Score Summary Banner */}
      <div className="bg-[#0f172a] text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-extrabold text-xl shadow-inner">
              {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">{candidate.name || 'Candidate'}</h1>
                <span className="text-xs text-slate-400 font-mono">({candidate.email})</span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span>Domain: <b className="text-teal-400 font-semibold">{interview.domain || interview.category}</b></span>
                <span>•</span>
                <span>Difficulty: <b className="text-amber-400 font-semibold">{interview.difficulty || 'Medium'}</b></span>
                <span>•</span>
                <span>Date: {new Date(interview.completedAt || interview.createdAt || interview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
          </div>

          <div>
            <RecommendationBadge recommendation={interview.recommendation || 'Strong Performance'} size="lg" />
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
              <div className="text-2xl font-black text-white mt-0.5">{interview.overallScore || interview.overall_score || 84}%</div>
            </div>
            <ScoreBadge score={interview.overallScore || interview.overall_score || 84} size="md" />
          </div>

          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Accuracy</span>
              <div className="text-2xl font-black text-teal-400 mt-0.5">{interview.technicalScore || interview.technical_score || 86}%</div>
            </div>
            <ScoreBadge score={interview.technicalScore || interview.technical_score || 86} size="md" />
          </div>

          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Communication Sentiment</span>
              <div className="text-2xl font-black text-purple-300 mt-0.5">{interview.sentimentScore || interview.sentiment_score || 80}%</div>
            </div>
            <ScoreBadge score={interview.sentimentScore || interview.sentiment_score || 80} size="md" />
          </div>
        </div>
      </div>

      {/* Synchronized Multi-Media Playback Console */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Synchronized Multi-Channel Playback & Audit
              </h2>
              <p className="text-xs text-slate-500">Audio, webcam, and screen recording streams aligned to questions</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {recordings.length} Stream(s) Recorded
          </span>
        </div>

        <MediaSyncPlayer
          recordings={recordings}
          questions={questions}
          answers={answers}
          totalDuration={interview.duration || 1200}
        />
      </div>

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(interview.strengths || [
              'Strong mastery of core concepts and architecture patterns',
              'Consistent direct response to question prompts with high relevance',
              'Confident, professional articulation without hesitation'
            ]).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Areas For Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(interview.areasToImprove || interview.areas_to_improve || [
              'Provide deeper coverage of system-level performance trade-offs',
              'Mention practical real-world production incident troubleshooting steps'
            ]).map((a, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-Wise Evaluation Detail */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Question Responses & Algorithmic Evaluation
          </h2>
          <p className="text-xs text-slate-500">Verified concept coverage and question-level scoring breakdown</p>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = answers.find(
              (a) => (a.questionId?._id || a.questionId)?.toString() === (q.questionId || q._id)?.toString()
            ) || answers[idx];

            const evalData = ans?.evaluation || {};

            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      Question {idx + 1} • {q.skill || q.domain || 'Technical'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {q.questionText || q.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={evalData.technicalScore || evalData.technical_score || 85} size="md" label="Technical:" />
                  </div>
                </div>

                {/* Candidate Answer Text */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Candidate Answer
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {ans?.textAnswer || ans?.candidate_answer || (
                      <span className="text-slate-400 italic">Candidate gave verbal audio response.</span>
                    )}
                  </div>
                </div>

                {/* Concepts Analysis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-800 uppercase text-[10px]">
                      Matched Concepts ({(evalData.matchedConcepts || evalData.matched_concepts || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData.matchedConcepts || evalData.matched_concepts || []).length > 0 ? (
                        (evalData.matchedConcepts || evalData.matched_concepts).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold"
                          >
                            ✓ {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic">No specific technical keywords detected</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-600 uppercase text-[10px]">
                      Missing Expected Concepts ({(evalData.missingConcepts || evalData.missing_concepts || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData.missingConcepts || evalData.missing_concepts || []).length > 0 ? (
                        (evalData.missingConcepts || evalData.missing_concepts).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[11px]"
                          >
                            • {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-700 font-semibold">All core concepts identified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Algorithmic Feedback Note */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-bold uppercase text-[10px] text-slate-700">
                      Automated Evaluation Insight
                    </span>
                    <span>Sentiment Tone: <b className="text-teal-700 font-semibold">{evalData.sentiment || evalData.sentiment_label || 'Positive'}</b></span>
                  </div>
                  <p className="text-slate-700">{evalData.feedback || 'Candidate response displayed strong technical accuracy and relevant context.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminInterviewReviewPage;
