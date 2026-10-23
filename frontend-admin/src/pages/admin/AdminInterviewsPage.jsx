import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import ScoreBadge from '../../components/common/ScoreBadge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import EmptyState from '../../components/common/EmptyState';
import { Briefcase, Search, ArrowRight, Filter, FileText, CheckCircle2 } from 'lucide-react';

export const AdminInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await interviewAPI.getAllInterviews();
        if (res.data?.success) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        console.error('[Admin Interviews Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = interviews.filter((i) => {
    const matchesSearch =
      (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.candidate_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Enterprise Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            Audit & Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Interview Assessment Audit
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Review candidate technical sessions, multi-modal audio/video telemetry, automated algorithmic competency evaluations, and recruiter audit reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200 font-semibold shadow-inner">
            <Briefcase className="w-4 h-4 text-teal-400" />
            <span>{interviews.length} Total Submissions</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, assessment title, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all shadow-2xs"
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
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading interview records...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Assessment Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Overall Score</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{item.candidate_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.candidate_email}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{item.title}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {item.overall_score ? (
                        <ScoreBadge score={item.overall_score} />
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <RecommendationBadge recommendation={item.recommendation || 'Evaluated'} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/candidate/results/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold border border-teal-200 transition-all text-xs"
                          title="View Comprehensive AI Scorecard"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>AI Report</span>
                        </Link>
                        <Link
                          to={`/review/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition-all text-xs"
                          title="Audit Media and Synchronized Streams"
                        >
                          <span>Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Briefcase}
              title="No interview records found"
              description="No candidate assessments match the current filter criteria."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInterviewsPage;
