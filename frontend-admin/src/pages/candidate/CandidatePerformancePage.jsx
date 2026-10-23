import React, { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import ScoreTrendLine from '../../components/charts/ScoreTrendLine';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import SentimentDonut from '../../components/charts/SentimentDonut';
import { Award, Brain, TrendingUp, CheckCircle2, Layers } from 'lucide-react';

export const CandidatePerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await candidateAPI.getCandidateDashboard();
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('[Performance Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const skillBreakdown = data?.skillBreakdown || [
    { skill: 'JavaScript', score: 86 },
    { skill: 'React', score: 91 },
    { skill: 'SQL', score: 78 },
    { skill: 'Data Structures', score: 82 },
    { skill: 'DBMS', score: 75 },
    { skill: 'Node.js', score: 80 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Performance Analytics & Skill Mastery
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed longitudinal analysis of your technical evaluations and concept depth.
        </p>
      </div>

      {/* Grid of 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Line */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Score Progression Over Time</h3>
          <p className="text-xs text-slate-400 mb-4">Overall Score vs Technical Competency</p>
          <ScoreTrendLine data={data?.performanceTrend || []} />
        </div>

        {/* Category Competency Bar Chart */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
          <h3 className="text-base font-bold text-white mb-1">Domain Competency Ratings</h3>
          <p className="text-xs text-slate-400 mb-4">Average score by technical discipline</p>
          <CategoryBarChart
            data={skillBreakdown.map((s) => ({
              category: s.skill,
              avgScore: s.score,
            }))}
          />
        </div>
      </div>

      {/* Detailed Skill Cards */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Verified Skill Proficiency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skillBreakdown.map((item, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.skill}</span>
                <span className="font-extrabold text-blue-400">{item.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${item.score}%`,
                    backgroundColor: item.score >= 85 ? '#10b981' : item.score >= 75 ? '#3b82f6' : '#f59e0b',
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {item.score >= 85 ? 'Mastery Level' : item.score >= 70 ? 'Proficient Level' : 'Developing'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidatePerformancePage;
