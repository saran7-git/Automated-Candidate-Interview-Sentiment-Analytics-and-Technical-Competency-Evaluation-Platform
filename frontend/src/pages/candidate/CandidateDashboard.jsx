import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidateAPI } from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import ScoreBadge from '../../components/common/ScoreBadge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import ScoreTrendLine from '../../components/charts/ScoreTrendLine';
import {
  Brain,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await candidateAPI.getCandidateDashboard();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Dashboard Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalInterviews: 12,
    averageScore: 82,
    bestScore: 91,
    completionRate: 95,
  };

  const skillBreakdown = data?.skillBreakdown || [
    { skill: 'JavaScript', score: 86 },
    { skill: 'React', score: 91 },
    { skill: 'SQL', score: 78 },
    { skill: 'Data Structures', score: 82 },
    { skill: 'DBMS', score: 75 },
  ];

  const recentInterviews = data?.recentInterviews || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131b2e] to-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Good morning, {user?.name || 'Candidate'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's an overview of your technical interview performance and AI competencies.
          </p>
        </div>

        <Link
          to="/candidate/interview/setup"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-glow-blue flex-shrink-0"
        >
          <PlayCircle className="w-5 h-5" />
          Start Technical Interview
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Interviews"
          value={stats.totalInterviews}
          subtitle="Assessments taken"
          icon={Brain}
          color="blue"
        />
        <MetricCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Across all domains"
          icon={Award}
          color="emerald"
        />
        <MetricCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          subtitle="Top performance"
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          subtitle="On-time submissions"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* Performance Overview & Skill Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Performance Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical interview scores and technical competency trends</p>
            </div>
            <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              Live Recharts
            </span>
          </div>
          <ScoreTrendLine data={data?.performanceTrend || []} />
        </div>

        {/* Skill Breakdown Horizontal Progress Bars (1 Col) */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight">Skill Breakdown</h3>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-6">Competency proficiency across evaluated tech stacks</p>

            <div className="space-y-4">
              {skillBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{item.skill}</span>
                    <span className="text-blue-400 font-bold">{item.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: item.score >= 85 ? '#10b981' : item.score >= 75 ? '#3b82f6' : '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              to="/candidate/performance"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-between"
            >
              <span>View Full Skill Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Interviews Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Interviews</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your past technical sessions and AI evaluated reports</p>
          </div>
          <Link
            to="/candidate/interviews"
            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
          >
            View All History →
          </Link>
        </div>

        {recentInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Interview Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {recentInterviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{item.title}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.overall_score ? (
                        <ScoreBadge score={item.overall_score} />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <RecommendationBadge recommendation={item.recommendation || (item.status === 'evaluated' ? 'Completed' : 'In Progress')} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/candidate/results/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        View Report
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No completed assessments yet. Start your first assessment to build your portfolio!
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
