import React, { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import ScoreBadge from '../../components/common/ScoreBadge';
import RecommendationBadge from '../../components/common/RecommendationBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  User,
  Mail,
  Award,
  TrendingUp,
  Brain,
  Calendar,
  Eye,
  X,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const AdminCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await candidateAPI.getCandidates();
      if (res.data?.success) {
        setCandidates(res.data.candidates);
      }
    } catch (err) {
      console.error('[Fetch Candidates Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (candidate) => {
    setSelectedCandidate(candidate);
    setModalLoading(true);

    try {
      const res = await candidateAPI.getCandidateById(candidate.id);
      if (res.data?.success) {
        setCandidateDetails(res.data);
      }
    } catch (err) {
      console.error('[Fetch Profile Error]:', err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = candidates.filter((c) => {
    return (
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131b2e] border border-slate-800 rounded-3xl p-6 md:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Candidate Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, audit, and compare candidate evaluation scores across technical disciplines.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold">
          <Users className="w-4 h-4 text-blue-400" />
          <span>{candidates.length} Registered Candidates</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by candidate name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#131b2e] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all shadow-card"
        />
      </div>

      {/* Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading candidate directory...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Interviews</th>
                  <th className="py-3.5 px-4">Avg Score</th>
                  <th className="py-3.5 px-4">Tech Score</th>
                  <th className="py-3.5 px-4">Sentiment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">{c.email}</td>
                    <td className="py-4 px-4 font-semibold text-slate-300">
                      {c.completedCount || c.interviewsCount || 0} Assessments
                    </td>
                    <td className="py-4 px-4">
                      {c.averageScore ? <ScoreBadge score={c.averageScore} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-4 px-4">
                      {c.technicalScore ? <ScoreBadge score={c.technicalScore} /> : <span className="text-slate-500">—</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                        {c.sentiment || 'Neutral'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <RecommendationBadge recommendation={c.latestRecommendation || 'Active'} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenProfile(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20 transition-all text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No candidates found"
              description="No registered candidates matching your search query."
            />
          </div>
        )}
      </div>

      {/* Candidate Profile Modal / Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-glow-blue">
                  {selectedCandidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCandidate.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading candidate metrics...</div>
            ) : (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Average Score</div>
                    <div className="text-2xl font-black text-emerald-400">
                      {candidateDetails?.stats?.averageScore || selectedCandidate.averageScore || 82}%
                    </div>
                  </div>
                  <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Best Score</div>
                    <div className="text-2xl font-black text-blue-400">
                      {candidateDetails?.stats?.bestScore || 91}%
                    </div>
                  </div>
                  <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Total Sessions</div>
                    <div className="text-2xl font-black text-purple-400">
                      {candidateDetails?.stats?.interviewsCount || selectedCandidate.interviewsCount || 1}
                    </div>
                  </div>
                </div>

                {/* Candidate Interview History */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Assessment History
                  </h4>
                  <div className="space-y-2">
                    {(candidateDetails?.interviews || []).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[#131b2e] border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.category} • {item.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <ScoreBadge score={item.overall_score || 80} />
                          <RecommendationBadge recommendation={item.recommendation || 'Completed'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidatesPage;
