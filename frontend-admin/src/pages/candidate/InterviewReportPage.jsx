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
  Printer,
  ShieldCheck
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Generating AI Performance Audit & Report...</p>
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
      'Answers are consistently relevant and directly address question prompts',
      'Clear, confident, and professional technical articulation',
    ],
    areas_to_improve: [
      'Provide more detailed edge case and performance trade-off explanations',
      'Improve depth on advanced internal concurrency and distributed mechanics',
      'Include practical code structure snippets in descriptive explanations',
    ],
  };

  const interview = data?.interview || {
    title: 'Technical Assessment',
    category: 'React.js',
    candidate_name: 'Candidate Assessment',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Back Button & Actions (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Interviews</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* 1. REPORT HEADER */}
      <div className="bg-[#0f172a] text-white border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-400">
              {interview.category} Assessment
            </span>
            <RecommendationBadge recommendation={result.recommendation || 'Strong Performance'} size="lg" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Interview Performance & Evaluation Report
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Candidate: <strong className="text-white font-semibold">{interview.candidate_name || 'Candidate'}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(interview.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Circular Main Score Indicator */}
        <div className="flex-shrink-0">
          <ScoreGauge score={result.overall_score} size={150} label="Overall Score" />
        </div>
      </div>

      {/* 2. 4-PILLAR SCORE BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Technical Competency */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">{result.technical_score}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Technical Competency</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Accuracy and concept depth (60% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${result.technical_score}%` }} />
          </div>
        </div>

        {/* Pillar 2: Answer Relevance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">{result.relevance_score || 89}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Answer Relevance</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Prompt alignment (25% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${result.relevance_score || 89}%` }} />
          </div>
        </div>

        {/* Pillar 3: Concept Coverage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">{result.concept_coverage_score || 81}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Concept Coverage</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Core keyword & terminology match</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${result.concept_coverage_score || 81}%` }} />
          </div>
        </div>

        {/* Pillar 4: Communication Sentiment */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">{result.sentiment_score || 78}%</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Communication Sentiment</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Tone & clarity (15% weight)</p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${result.sentiment_score || 78}%` }} />
          </div>
        </div>
      </div>

      {/* 3. AI PERFORMANCE INSIGHTS (Strengths & Areas to Improve) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Evaluation Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demonstrated Strengths</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Areas for Improvement</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {areasToImprove.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⚠</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. QUESTION-WISE ANALYSIS ACCORDIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Question-Wise Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">Granular breakdown of detected concepts, candidate responses, and automated feedback</p>
        </div>

        <div className="space-y-3">
          {evaluations.map((ev, idx) => {
            const isOpen = expandedIndex === idx;
            const matched = Array.isArray(ev.matched_concepts) ? ev.matched_concepts : [];
            const missing = Array.isArray(ev.missing_concepts) ? ev.missing_concepts : [];

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-colors"
              >
                {/* Header Strip */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isOpen ? -1 : idx)}
                  className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                      Question {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {ev.question_text || ev.question || `Question ${idx + 1}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Technical:</span>
                      <span className="font-bold text-teal-700">{ev.technical_score}%</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Relevance:</span>
                      <span className="font-bold text-blue-700">{ev.relevance_score}%</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {ev.sentiment_label || 'Positive'}
                    </span>
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Content Body */}
                {isOpen && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4 text-xs">
                    {/* Candidate's Answer */}
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-[10px]">
                        Recorded Candidate Answer
                      </p>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-[12px] leading-relaxed">
                        {ev.candidate_answer || 'No textual response recorded.'}
                      </div>
                    </div>

                    {/* Detected & Missing Concepts */}
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-[10px]">
                        Detected Technical Concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matched.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {c}
                          </span>
                        ))}
                        {missing.map((c, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-medium text-[11px]"
                          >
                            ○ {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div>
                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-1 text-[10px]">
                        Algorithmic Feedback
                      </p>
                      <p className="text-slate-700 leading-relaxed font-normal">
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
