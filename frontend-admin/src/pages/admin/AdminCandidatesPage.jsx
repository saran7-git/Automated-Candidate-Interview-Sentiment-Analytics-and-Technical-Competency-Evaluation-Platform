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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Recruitment Talent Pool</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Directory & Assessment Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Search, review, and compare candidate performance scores, AI evaluations, and proctoring audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-bold shadow-2xs">
          <Users className="w-4 h-4 text-teal-400" />
          <span>{candidates.length} Registered Candidates</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by candidate name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all shadow-2xs"
        />
      </div>

      {/* Candidates Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading candidate talent directory...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/75">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assessments</th>
                  <th className="py-3.5 px-4">Overall Score</th>
                  <th className="py-3.5 px-4">Tech Score</th>
                  <th className="py-3.5 px-4">Sentiment</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-bold flex items-center justify-center text-xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{c.email}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {c.completedCount || c.interviewsCount || 0} Sessions
                    </td>
                    <td className="py-4 px-4">
                      {c.averageScore ? <ScoreBadge score={c.averageScore} /> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-4 px-4">
                      {c.technicalScore ? <ScoreBadge score={c.technicalScore} /> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-all text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        Audit Profile
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

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-lg shadow-sm">
                  {selectedCandidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedCandidate.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCandidate.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">Loading candidate performance metrics...</div>
            ) : (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Average Score</div>
                    <div className="text-2xl font-black text-teal-700">
                      {candidateDetails?.stats?.averageScore || selectedCandidate.averageScore || 82}%
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Best Score</div>
                    <div className="text-2xl font-black text-blue-700">
                      {candidateDetails?.stats?.bestScore || 91}%
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="text-xs text-slate-500 font-semibold mb-1">Total Sessions</div>
                    <div className="text-2xl font-black text-slate-900">
                      {candidateDetails?.stats?.interviewsCount || selectedCandidate.interviewsCount || 1}
                    </div>
                  </div>
                </div>

                {/* Candidate Interview History */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Assessment Evaluation History
                  </h4>
                  <div className="space-y-2">
                    {(candidateDetails?.interviews || []).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[10px] text-slate-500">{item.category} • {item.difficulty}</p>
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
