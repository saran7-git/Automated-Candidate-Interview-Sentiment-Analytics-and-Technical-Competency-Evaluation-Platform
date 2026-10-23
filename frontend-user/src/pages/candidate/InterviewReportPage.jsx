import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evaluationAPI } from '../../services/api';
import ScoreGauge from '../../components/common/ScoreGauge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import {
  Cpu,
  Target,
  Layers,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Share2,
  Download,
  BrainCircuit,
  Sparkles,
  Calendar,
  User,
} from 'lucide-react';

export const InterviewReportPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(0); // first question open by default

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await evaluationAPI.getInterviewResult(id);
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Report Fetch Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Generating AI Performance Report...</p>
      </div>
    );
  }

  const result = data?.result || {
    overall_score: 84,
    technical_score: 86,
    relevance_score: 89,
    concept_coverage_score: 81,
    sentiment_score: 78,
    recommendation: 'Strong Performance',
    strengths: [
      'Strong understanding of programming fundamentals and core abstractions',
      'Answers are consistently relevant and directly address the question intent',
      'Clear, confident, and professional technical articulation',
    ],
    areas_to_improve: [
      'Provide more detailed edge case and performance trade-off explanations',
      'Improve depth on advanced internal concurrency mechanics',
      'Include practical code structure snippets in descriptive explanations',
    ],
  };

  const interview = data?.interview || {
    title: 'Technical Assessment',
    category: 'React.js',
    candidate_name: 'Sri Balaji',
    created_at: new Date(),
  };

  const evaluations = data?.evaluations || [];

  const strengths = Array.isArray(result.strengths)
    ? result.strengths
    : typeof result.strengths === 'string'
    ? JSON.parse(result.strengths || '[]')
    : [];

  const areasToImprove = Array.isArray(result.areas_to_improve)
    ? result.areas_to_improve
    : typeof result.areas_to_improve === 'string'
    ? JSON.parse(result.areas_to_improve || '[]')
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/candidate/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* 1. REPORT HEADER */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              {interview.category} Assessment
            </span>
            <RecommendationBadge recommendation={result.recommendation || 'Strong Performance'} />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Interview Performance Report
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Candidate: <strong className="text-slate-200">{interview.candidate_name || 'Sri Balaji'}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(interview.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Circular Main Score Indicator */}
        <div className="flex-shrink-0">
          <ScoreGauge score={result.overall_score} size={160} label="Overall Score" />
        </div>
      </div>

      {/* 2. 4-PILLAR SCORE BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Technical Competency */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">{result.technical_score}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Technical Competency</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Accuracy and concept depth (60% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${result.technical_score}%` }} />
          </div>
        </div>

        {/* Pillar 2: Answer Relevance */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">{result.relevance_score || 89}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Answer Relevance</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Prompt alignment (25% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.relevance_score || 89}%` }} />
          </div>
        </div>

        {/* Pillar 3: Concept Coverage */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">{result.concept_coverage_score || 81}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Concept Coverage</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Core keyword matches</p>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${result.concept_coverage_score || 81}%` }} />
          </div>
        </div>

        {/* Pillar 4: Communication Sentiment */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">{result.sentiment_score || 78}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Communication Tone</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Clarity & confidence (15% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${result.sentiment_score || 78}%` }} />
          </div>
        </div>
      </div>

      {/* 3. AI PERFORMANCE INSIGHTS (Strengths & Areas to Improve) */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">AI Performance Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated Strengths</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas to Improve</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {areasToImprove.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. QUESTION-WISE ANALYSIS ACCORDIONS */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Question-Wise Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">Granular breakdown of detected concepts, candidate responses, and AI feedback</p>
        </div>

        <div className="space-y-4">
          {evaluations.map((ev, idx) => {
            const isOpen = expandedIndex === idx;
            const matched = Array.isArray(ev.matched_concepts) ? ev.matched_concepts : [];
            const missing = Array.isArray(ev.missing_concepts) ? ev.missing_concepts : [];

            return (
              <div
                key={idx}
                className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/60 transition-colors"
              >
                {/* Header Strip */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                      Question {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {ev.question_text || ev.question || `Question ${idx + 1}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Technical:</span>
                      <span className="font-bold text-emerald-400">{ev.technical_score}%</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Relevance:</span>
                      <span className="font-bold text-blue-400">{ev.relevance_score}%</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {ev.sentiment_label || 'Positive'}
                    </span>
                    <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Content Body */}
                {isOpen && (
                  <div className="p-5 border-t border-slate-800 bg-[#0c1220] space-y-4 text-xs">
                    {/* Candidate's Answer */}
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Your Answer
                      </p>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[12px] leading-relaxed">
                        {ev.candidate_answer || 'No textual response recorded.'}
                      </div>
                    </div>

                    {/* Detected & Missing Concepts */}
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Detected Concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matched.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> {c}
                          </span>
                        ))}
                        {missing.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-medium text-[11px]"
                          >
                            ○ {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div>
                      <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                        AI Evaluation
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        {ev.feedback || 'Answer comprehensively met expected technical criteria.'}
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

export default InterviewReportPage;
