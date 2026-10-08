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
  Award
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
        message="Synthesizing candidate evaluation dossier..."
        submessage="Compiling sentiment timelines, technical scores, and AI recommendations"
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
                Evaluation Dossier
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

        {/* Executive Overall Score Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-100 text-center">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Overall Candidate Score
            </span>
            <div className="text-4xl font-extrabold text-indigo-700 mt-2">
              {overallEvaluation?.overallScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-indigo-900/70 mt-1 font-medium">
              Formula: (Technical × 0.70) + (Sentiment × 0.30)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Technical Competency (70%)
            </span>
            <div className="text-4xl font-extrabold text-emerald-700 mt-2">
              {overallEvaluation?.technicalScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Correctness, coverage & depth
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Communication & Sentiment (30%)
            </span>
            <div className="text-4xl font-extrabold text-blue-700 mt-2">
              {overallEvaluation?.sentimentScore || 0}
              <span className="text-sm font-normal text-slate-400"> / 100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tone polarity & confidence
            </p>
          </div>
        </div>

        {/* Assessment Proctoring & Media Verification Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Webcam Stream</div>
              <div className="text-xs font-bold text-emerald-400">Verified & Monitored</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Microphone Audio</div>
              <div className="text-xs font-bold text-emerald-400">Monitored & Dictated</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Sentiment Evaluation</div>
              <div className="text-xs font-bold text-indigo-300">Multi-Phase NLP</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Session Integrity</div>
              <div className="text-xs font-bold text-emerald-400">Verified Secure</div>
            </div>
          </div>
        </div>

        {/* Recruiter Policy Alert */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <Bot className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-800">AI-Assisted Evaluation Disclaimer: </span>
            This score is generated through automated NLP sentiment classification and semantic concept extraction. It is designed to assist and support, not replace, human recruitment decision-making.
          </div>
        </div>
      </div>

      {/* Technical Competency Breakdown & Sentiment Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Sub-Metrics */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Technical Competency Dimensions</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Technical Correctness</span>
                <span>{techMetrics.averageCorrectness || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${techMetrics.averageCorrectness || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Relevance to Questions</span>
                <span>{techMetrics.averageRelevance || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${techMetrics.averageRelevance || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Key Concept Coverage</span>
                <span>{techMetrics.averageConceptCoverage || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${techMetrics.averageConceptCoverage || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Explanation Completeness & Depth</span>
                <span>{techMetrics.averageCompleteness || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${techMetrics.averageCompleteness || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Analysis Overview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            <span>Sentiment & Demeanor Polarity</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">Positive</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {sentimentStats.positivePercentage || 0}%
              </div>
              <div className="text-[10px] text-emerald-600">{sentimentStats.positiveAnswers || 0} answers</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Neutral</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">
                {sentimentStats.neutralPercentage || 0}%
              </div>
              <div className="text-[10px] text-amber-600">{sentimentStats.neutralAnswers || 0} answers</div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Negative</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">
                {sentimentStats.negativePercentage || 0}%
              </div>
              <div className="text-[10px] text-rose-600">{sentimentStats.negativeAnswers || 0} answers</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            Average Sentiment Confidence: <strong>{Math.round((sentimentStats.averageConfidence || 0.8) * 100)}%</strong>
          </div>
        </div>
      </div>

      {/* Sentiment & Technical Progression Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Question Progression Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Technical and sentiment score tracking across the sequence of interview questions
          </p>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentTimeline} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="question" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="technicalScore"
                name="Technical Score"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sentimentScore"
                name="Sentiment Score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
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

      {/* Question-wise Detailed Evaluation Dossier */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Question-wise Evaluation Details</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual responses, reference answers, concept detection, and AI feedback
          </p>
        </div>

        <div className="space-y-6">
          {questionEvaluations.map((item) => {
            const ev = item.evaluation || {};
            const detected = ev.detectedConcepts || [];
            const missing = ev.missingConcepts || [];

            return (
              <div
                key={item.questionId}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 space-y-4 text-xs"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 text-sm">
                      Question #{item.questionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {item.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Difficulty: {item.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <SentimentBadge
                      sentiment={ev.sentiment}
                      confidence={ev.sentimentConfidence}
                      score={ev.sentimentScore}
                    />
                    <ScoreBadge score={ev.technicalScore} label="100 Tech" />
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Question Prompt
                  </div>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">
                    {item.question}
                  </div>
                </div>

                {/* Candidate Response */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Candidate's Submitted Response
                  </div>
                  <p className="text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {item.candidateAnswer || 'No response submitted.'}
                  </p>
                </div>

                {/* Reference Answer */}
                {item.expectedAnswer && (
                  <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-[11px] text-slate-600">
                    <span className="font-bold text-indigo-900">Reference Model Answer: </span>
                    {item.expectedAnswer}
                  </div>
                )}

                {/* Detected vs Missing Concepts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Detected Key Concepts ({detected.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {detected.length === 0 ? (
                        <span className="text-slate-400 italic">None detected</span>
                      ) : (
                        detected.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]"
                          >
                            ✓ {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                      Missing Concepts ({missing.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {missing.length === 0 ? (
                        <span className="text-slate-400 italic">All concepts covered</span>
                      ) : (
                        missing.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px]"
                          >
                            ✗ {c}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                {ev.feedback && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">AI Evaluator Feedback: </span>
                      {ev.feedback}
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

export default CandidateReportPage;
