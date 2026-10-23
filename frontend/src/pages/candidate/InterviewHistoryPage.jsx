import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import ScoreBadge from '../../components/common/ScoreBadge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import EmptyState from '../../components/common/EmptyState';
import { History, PlayCircle, ArrowRight, Search, Filter } from 'lucide-react';

export const InterviewHistoryPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await interviewAPI.getCandidateHistory();
        if (res.data?.success) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        console.error('[History Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = interviews.filter((i) => {
    const matchSearch = (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || i.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131b2e] border border-slate-800 rounded-3xl p-6 md:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Interview History & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access past assessments, detailed concept audits, and evaluation metrics.
          </p>
        </div>

        <Link
          to="/candidate/interview/setup"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue flex-shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by assessment title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 text-xs text-slate-300 font-semibold outline-none focus:border-blue-500 transition-all"
        >
          <option value="All">All Categories</option>
          <option value="React">React</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Node.js">Node.js</option>
          <option value="SQL">SQL</option>
          <option value="DBMS">DBMS</option>
          <option value="Data Structures">Data Structures</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-5">Assessment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Overall Score</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-bold text-white">{item.title}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-300">{item.difficulty}</td>
                    <td className="py-4 px-4">
                      {item.overall_score ? <ScoreBadge score={item.overall_score} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-4 px-4">
                      <RecommendationBadge recommendation={item.recommendation || (item.status === 'evaluated' ? 'Completed' : 'In Progress')} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/candidate/results/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20 transition-all text-xs"
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
          <div className="p-8">
            <EmptyState
              icon={History}
              title="No interview history found"
              description="You haven't completed any technical assessments in this filter."
              actionText="Start New Assessment"
              actionLink="/candidate/interview/setup"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistoryPage;
