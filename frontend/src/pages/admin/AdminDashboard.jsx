import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import ScoreBadge from '../../components/common/ScoreBadge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import SentimentDonut from '../../components/charts/SentimentDonut';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import {
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  ArrowRight,
  Shield,
  BarChart3,
  Heart,
  Briefcase,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await adminAPI.getAdminDashboard();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Admin Dashboard Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  const stats = data?.stats || {
    totalCandidates: 248,
    interviewsCompleted: 183,
    averageScore: 78,
    topCandidateScore: 94,
  };

  const categoryPerformance = data?.categoryPerformance || [];
  const scoreDistribution = data?.scoreDistribution || [];
  const sentimentDistribution = data?.sentimentDistribution || [];
  const recentInterviews = data?.recentInterviews || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131b2e] to-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Recruiter Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Recruitment Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor candidate performance, score distributions, and real-time interview analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/questions"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            Manage Question Bank
          </Link>
          <Link
            to="/admin/candidates"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue"
          >
            View Candidates
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Candidates"
          value={stats.totalCandidates}
          subtitle="Registered profiles"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Interviews Completed"
          value={stats.interviewsCompleted}
          subtitle="Evaluated sessions"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Platform benchmark"
          icon={Award}
          color="purple"
        />
        <MetricCard
          title="Top Candidate"
          value={`${stats.topCandidateScore}%`}
          subtitle="Highest rating"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Technical Performance by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Average technical rating across technical domains</p>
            </div>
            <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              Domain Ratings
            </span>
          </div>
          <CategoryBarChart data={categoryPerformance} />
        </div>

        {/* Sentiment Distribution Donut (1 col) */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight">Sentiment Distribution</h3>
              <Heart className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-slate-400 mb-2">Emotional tone and candidate confidence levels</p>
            <SentimentDonut data={sentimentDistribution} />
          </div>
        </div>
      </div>

      {/* Score Distribution & Recent Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution (1 col) */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight">Score Distribution</h3>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-2">Candidate distribution across performance tiers</p>
            <ScoreDistributionChart data={scoreDistribution} />
          </div>
        </div>

        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Submissions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest technical assessment evaluations</p>
            </div>
            <Link
              to="/admin/interviews"
              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              View All Interviews →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Recommendation</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {recentInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.candidate_name || 'Candidate'}
                      <div className="text-[10px] text-slate-400 font-normal">{item.candidate_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.overall_score ? <ScoreBadge score={item.overall_score} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <RecommendationBadge recommendation={item.recommendation || 'Evaluated'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/candidate/results/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Review
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
