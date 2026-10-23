import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import SentimentDonut from '../../components/charts/SentimentDonut';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import { BarChart2, Heart, PieChart, CheckCircle2, TrendingUp, Award, Users } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Enterprise Header Banner */}
      <div className="bg-[#0f172a] text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
          Talent Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Recruitment Intelligence & Analytics
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Aggregated cohort performance distributions, technical domain mastery across assessment questions, and communication sentiment analysis.
        </p>
      </div>

      {/* Grid of 2 Charts Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Category Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Technical Domain Mastery</h3>
              <p className="text-xs text-slate-500">Average candidate score across evaluated technologies</p>
            </div>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <CategoryBarChart data={categoryPerformance} />
          </div>
        </div>

        {/* Sentiment Donut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Candidate Communication Sentiment</h3>
              <p className="text-xs text-slate-500">Verbal and response tone breakdown (Positive, Neutral, Negative)</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <SentimentDonut data={sentimentDistribution} />
          </div>
        </div>
      </div>

      {/* Grid of 2 Charts Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Candidate Score Tier Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown by performance bracket (High, Good, Average, Low)</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <ScoreDistributionChart data={scoreDistribution} />
          </div>
        </div>

        {/* Assessment Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Interview Pipeline Progress</h3>
                <p className="text-xs text-slate-500">Evaluation lifecycle completion metrics</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {completionStats.map((st, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{st.name}</span>
                    <span className="text-teal-700 font-bold">{st.value} Assessments</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-teal-600"
                      style={{
                        width: `${Math.min(100, Math.max(15, (st.value / (data?.stats?.totalInterviews || 200)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-6 text-xs text-slate-600 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <strong className="text-slate-800">Recruitment Insight:</strong> Over 75% of candidates demonstrate strong competency in modern web frameworks (React, JavaScript). Algorithmic problem-solving and Database queries display the highest variance in evaluation scores.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
