import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import SentimentDonut from '../../components/charts/SentimentDonut';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import { BarChart2, Heart, PieChart, CheckCircle2, TrendingUp } from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminAPI.getAdminAnalytics();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Analytics Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const categoryPerformance = data?.categoryPerformance || [];
  const scoreDistribution = data?.scoreDistribution || [];
  const sentimentDistribution = data?.sentimentDistribution || [];
  const completionStats = data?.completionStats || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Recruitment Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive cohort distribution, technical domain mastery, and communication sentiment analysis.
        </p>
      </div>

      {/* Grid of 2 Charts Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Category Chart */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">Technical Domain Mastery</h3>
            <BarChart2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 mb-4">Average candidate score across evaluated technologies</p>
          <CategoryBarChart data={categoryPerformance} />
        </div>

        {/* Sentiment Donut */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">Candidate Communication Sentiment</h3>
            <Heart className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400 mb-4">Lexicon tone breakdown (Positive, Neutral, Negative)</p>
          <SentimentDonut data={sentimentDistribution} />
        </div>
      </div>

      {/* Grid of 2 Charts Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">Candidate Score Tier Distribution</h3>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 mb-4">Breakdown by performance bracket (High, Good, Average, Low)</p>
          <ScoreDistributionChart data={scoreDistribution} />
        </div>

        {/* Assessment Status Breakdown */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight">Interview Completion Pipeline</h3>
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400 mb-6">Completed vs active sessions</p>

            <div className="space-y-4">
              {completionStats.map((st, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{st.name}</span>
                    <span className="text-emerald-400 font-bold">{st.value} Assessments</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.max(15, (st.value / (data?.stats?.totalInterviews || 200)) * 100))}%`,
                        backgroundColor: st.color || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mt-6 text-xs text-slate-400">
            💡 <strong>Hiring Insight:</strong> Over 75% of candidates demonstrate strong competency in React and JavaScript. SQL and DBMS exhibit the highest variance in candidate score distributions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
