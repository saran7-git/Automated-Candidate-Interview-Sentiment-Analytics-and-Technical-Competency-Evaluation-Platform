import React, { useState, useEffect } from 'react';
import { candidateAPI, dashboardAPI } from '../../api/client';
import ScoreBadge, { RecommendationBadge } from '../../components/ScoreBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CandidateComparisonPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const { error, info } = useToast();

  useEffect(() => {
    loadCompletedCandidates();
  }, []);

  const loadCompletedCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidateAPI.getAll();
      const completedList = (res.candidates || []).filter(
        (c) => c.status === 'Completed' && c.sessionId
      );
      setCandidates(completedList);

      // Default select the first two completed candidates
      if (completedList.length >= 2) {
        const initialIds = [completedList[0].sessionId, completedList[1].sessionId];
        setSelectedSessionIds(initialIds);
        fetchComparison(initialIds);
      }
    } catch (err) {
      error(err.message || 'Failed to load candidates for comparison');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (sessionIds) => {
    if (sessionIds.length < 2) {
      setComparisonResults([]);
      return;
    }
    try {
      setComparing(true);
      const res = await dashboardAPI.compareCandidates(sessionIds);
      setComparisonResults(res.comparison || []);
    } catch (err) {
      error(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const handleToggleCandidate = (sessionId) => {
    let next;
    if (selectedSessionIds.includes(sessionId)) {
      if (selectedSessionIds.length <= 2) {
        info('Please keep at least 2 candidates selected for comparison.');
        return;
      }
      next = selectedSessionIds.filter((id) => id !== sessionId);
    } else {
      if (selectedSessionIds.length >= 4) {
        info('You can compare a maximum of 4 candidates simultaneously.');
        return;
      }
      next = [...selectedSessionIds, sessionId];
    }
    setSelectedSessionIds(next);
    fetchComparison(next);
  };

  if (loading) {
    return <LoadingSpinner message="Loading candidates for comparative analysis..." />;
  }

  // Prepare chart data: comparing scores
  const scoreComparisonData = comparisonResults.map((c) => ({
    name: c.candidateName,
    'Technical (70%)': c.technicalScore,
    'Sentiment (30%)': c.sentimentScore,
    'Overall Score': c.overallScore
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <GitCompare className="w-7 h-7 text-indigo-600" />
          <span>Candidate Comparison Matrix</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Side-by-side evaluation comparison evaluating technical depth, sentiment tone, and automated hiring recommendations.
        </p>
      </div>

      {/* Candidate Selector Badges */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Select Candidates to Compare (2 - 4)
          </h3>
          <span className="text-xs font-semibold text-indigo-600">
            {selectedSessionIds.length} Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {candidates.map((cand) => {
            const isSelected = selectedSessionIds.includes(cand.sessionId);
            return (
              <button
                key={cand.sessionId}
                onClick={() => handleToggleCandidate(cand.sessionId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cand.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {cand.overallScore || 0}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {comparing ? (
        <LoadingSpinner message="Synthesizing multi-candidate comparison metrics..." isAi={true} />
      ) : comparisonResults.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Select at least two candidates with completed interviews to view side-by-side analytics.
        </div>
      ) : (
        <>
          {/* Comparative Bar Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <span>Score Comparison Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical competency (70%), Sentiment communication (30%), and Final weighted score
              </p>
            </div>

            <div className="h-72 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreComparisonData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Technical (70%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Sentiment (30%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Overall Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparisonResults.length} gap-6`}>
            {comparisonResults.map((cand) => (
              <div
                key={cand.sessionId}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5 flex flex-col"
              >
                {/* Header */}
                <div className="pb-4 border-b border-slate-100 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base mx-auto mb-2">
                    {cand.candidateName.charAt(0)}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{cand.candidateName}</h3>
                  <div className="text-xs text-slate-500">{cand.email}</div>
                  <div className="mt-2">
                    <RecommendationBadge recommendation={cand.recommendation} />
                  </div>
                </div>

                {/* Score Pills */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="font-semibold text-slate-600">Overall Score:</span>
                    <span className="font-extrabold text-indigo-700 text-sm">{cand.overallScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50">
                    <span className="font-semibold text-emerald-800">Technical (70%):</span>
                    <span className="font-bold text-emerald-700">{cand.technicalScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50">
                    <span className="font-semibold text-blue-800">Sentiment (30%):</span>
                    <span className="font-bold text-blue-700">{cand.sentimentScore}/100</span>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Competency Sub-Scores
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Correctness:</span>
                    <span className="font-bold">{cand.technicalMetrics?.averageCorrectness || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Relevance:</span>
                    <span className="font-bold">{cand.technicalMetrics?.averageRelevance || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Concept Coverage:</span>
                    <span className="font-bold">{cand.technicalMetrics?.averageConceptCoverage || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Completeness:</span>
                    <span className="font-bold">{cand.technicalMetrics?.averageCompleteness || 0}%</span>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Top Strengths</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[11px]">
                    {(cand.strengths || []).slice(0, 3).map((s, idx) => (
                      <li key={idx} className="leading-tight">• {s}</li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-auto border-t border-slate-100 text-center">
                  <a
                    href={`/admin/reports/${cand.sessionId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Individual Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateComparisonPage;
