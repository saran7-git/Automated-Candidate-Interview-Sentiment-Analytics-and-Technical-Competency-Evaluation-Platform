import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../api/client';
import StatCard from '../../components/StatCard';
import ScoreBadge, { RecommendationBadge } from '../../components/ScoreBadge';
import SentimentBadge from '../../components/SentimentBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  FileText,
  BarChart2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStatistics();
      setStats(res.statistics);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating recruitment analytics..." submessage="Parsing sentiment timelines and competency distributions" />;
  }

  const sentimentData = stats?.sentimentDistribution || [];
  const technicalData = stats?.technicalDistribution || [];
  const categoryData = stats?.categoryPerformance || [];
  const topCandidates = stats?.topCandidates || [];
  const recentCandidates = stats?.recentCandidates || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Analytics & Competency Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time automated evaluation metrics across technical competency and communication sentiment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/candidates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Manage Candidates</span>
          </Link>
          <Link
            to="/admin/compare"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Compare Candidates</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidates"
          value={stats?.totalCandidates || 0}
          subtitle="Enrolled applicants"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Interviews"
          value={stats?.totalInterviews || 0}
          subtitle="Template evaluations"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Avg Technical Score"
          value={`${stats?.averageTechnicalScore || 0}%`}
          subtitle="70% evaluation weight"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Avg Sentiment Score"
          value={`${stats?.averageSentimentScore || 0}%`}
          subtitle="30% communication weight"
          icon={BrainCircuit}
          color="amber"
        />
      </div>

      {/* Visual Analytics Row: Sentiment Donut & Technical Tier Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sentiment Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                NLP tone classification across all submitted answers
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              30% Overall Weight
            </span>
          </div>

          <div className="h-64 mt-4 w-full flex items-center justify-center">
            {sentimentData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} Answers`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No evaluated answers yet</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-slate-100 text-center">
            {sentimentData.map((s) => (
              <div key={s.name} className="p-2 rounded-xl bg-slate-50">
                <div className="text-[11px] font-semibold text-slate-500">{s.name}</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{s.percentage}%</div>
                <div className="text-[10px] text-slate-400">{s.count} answers</div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Competency Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Technical Competency Tiers</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Candidate distribution across mastery brackets
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              70% Overall Weight
            </span>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technicalData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} Candidates`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {technicalData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Score formula: Relevance (20%) + Correctness (40%) + Coverage (25%) + Completeness (15%)</span>
          </div>
        </div>
      </div>

      {/* Technical Category Breakdown Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Technical Category Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Average candidate score breakdown across technical disciplines
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {categoryData.length} Evaluated Disciplines
          </span>
        </div>

        <div className="h-72 mt-6 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#475569' }} angle={-25} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                formatter={(val) => [`${val} / 100`, 'Average Score']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="averageScore" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Candidate Evaluations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest candidate interview submissions with automated score breakdowns
            </p>
          </div>
          <Link
            to="/admin/candidates"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Interview Title</th>
                <th className="py-3 px-4 text-center">Technical (70%)</th>
                <th className="py-3 px-4 text-center">Sentiment (30%)</th>
                <th className="py-3 px-4 text-center">Overall</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No completed candidate evaluations available yet.
                  </td>
                </tr>
              ) : (
                recentCandidates.map((cand) => (
                  <tr key={cand.sessionId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cand.name}</div>
                      <div className="text-[11px] text-slate-400">{cand.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {cand.interview}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ScoreBadge score={cand.technicalScore} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ScoreBadge score={cand.sentimentScore} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-sm text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        {cand.overallScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RecommendationBadge recommendation={cand.recommendation} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/reports/${cand.sessionId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Dossier</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
