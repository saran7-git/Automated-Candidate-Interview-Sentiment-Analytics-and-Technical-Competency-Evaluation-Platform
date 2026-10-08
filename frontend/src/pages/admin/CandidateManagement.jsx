import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateAPI, interviewAPI, aiAPI } from '../../api/client';
import ScoreBadge from '../../components/ScoreBadge';
import SentimentBadge from '../../components/SentimentBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Bot,
  Eye,
  AlertCircle
} from 'lucide-react';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [interviewFilter, setInterviewFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [analyzingSessionId, setAnalyzingSessionId] = useState(null);

  // New Candidate Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interviewId: '',
    phone: '',
    skills: ''
  });
  const [creating, setCreating] = useState(false);

  const { success, error, info } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candRes, intRes] = await Promise.all([
        candidateAPI.getAll(),
        interviewAPI.getAll()
      ]);
      setCandidates(candRes.candidates || []);
      setInterviews(intRes.interviews || []);
    } catch (err) {
      error(err.message || 'Failed to load candidate directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      error('Name and email are required');
      return;
    }

    try {
      setCreating(true);
      await candidateAPI.create({
        name: formData.name,
        email: formData.email,
        interviewId: formData.interviewId || undefined,
        phone: formData.phone,
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
      });

      success(`Candidate ${formData.name} successfully registered.`);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', interviewId: '', phone: '', skills: '' });
      loadData();
    } catch (err) {
      error(err.message || 'Failed to create candidate');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return;
    try {
      await candidateAPI.delete(selectedCandidate.id);
      success(`Candidate ${selectedCandidate.name} deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedCandidate(null);
      loadData();
    } catch (err) {
      error(err.message || 'Failed to delete candidate');
    }
  };

  const handleRunAiAnalysis = async (sessionId, candidateName) => {
    if (!sessionId) {
      info('No submitted session available to analyze.');
      return;
    }

    try {
      setAnalyzingSessionId(sessionId);
      info(`Executing AI pipeline for ${candidateName}...`);
      await aiAPI.analyzeSession(sessionId);
      success(`AI re-evaluation completed for ${candidateName}!`);
      loadData();
    } catch (err) {
      error(err.message || 'AI analysis failed');
    } finally {
      setAnalyzingSessionId(null);
    }
  };

  // Filter pipeline
  const filteredCandidates = candidates.filter((c) => {
    // Search
    const term = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.interview && c.interview.toLowerCase().includes(term));

    if (!matchSearch) return false;

    // Status filter
    if (statusFilter !== 'ALL' && c.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Sentiment filter
    if (sentimentFilter !== 'ALL') {
      if (c.sentimentLabel !== sentimentFilter) return false;
    }

    // Interview filter
    if (interviewFilter !== 'ALL') {
      if (c.interview !== interviewFilter) return false;
    }

    // Score filter
    if (scoreFilter !== 'ALL') {
      const overall = c.overallScore;
      if (overall === null) return false;
      if (scoreFilter === 'HIGH' && overall < 80) return false;
      if (scoreFilter === 'MID' && (overall < 70 || overall >= 80)) return false;
      if (scoreFilter === 'LOW' && overall >= 70) return false;
    }

    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading candidate records..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            View enrolled candidates, monitor evaluations, execute AI analytics, and export interview dossiers.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate & Assign</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, email, or interview role..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>

            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Scores</option>
              <option value="HIGH">Score ≥ 80</option>
              <option value="MID">Score 70-79</option>
              <option value="LOW">Score &lt; 70</option>
            </select>

            {/* Interview Template Filter */}
            <select
              value={interviewFilter}
              onChange={(e) => setInterviewFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Interviews</option>
              {interviews.map((i) => (
                <option key={i._id || i.id} value={i.title}>
                  {i.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4">Interview Title</th>
                <th className="py-3.5 px-4 text-center">Technical (70%)</th>
                <th className="py-3.5 px-4 text-center">Sentiment (30%)</th>
                <th className="py-3.5 px-4 text-center">Overall</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Enrolled Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No candidates matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/80 transition">
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
                      {cand.sentimentScore !== null ? (
                        <SentimentBadge
                          sentiment={cand.sentimentLabel}
                          score={cand.sentimentScore}
                        />
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">N/A</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {cand.overallScore !== null ? (
                        <span className="font-extrabold text-sm text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                          {cand.overallScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {cand.status === 'Completed' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Completed
                        </span>
                      ) : cand.status === 'In Progress' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cand.date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {cand.sessionId && (
                          <>
                            {/* Run AI Analysis */}
                            <button
                              onClick={() => handleRunAiAnalysis(cand.sessionId, cand.name)}
                              disabled={analyzingSessionId === cand.sessionId}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                              title="Re-run AI Analysis"
                            >
                              <Bot className={`w-4 h-4 ${analyzingSessionId === cand.sessionId ? 'animate-spin' : ''}`} />
                            </button>

                            {/* View Report */}
                            <Link
                              to={`/admin/reports/${cand.sessionId}`}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                              title="View Interview Dossier"
                            >
                              <FileText className="w-4 h-4" />
                            </Link>
                          </>
                        )}

                        {/* Delete Candidate */}
                        <button
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Candidate & Assign Interview"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Candidate Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Maya Patel"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maya.patel@example.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assign to Interview Session
            </label>
            <select
              value={formData.interviewId}
              onChange={(e) => setFormData({ ...formData, interviewId: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-medium"
            >
              <option value="">-- Select Interview Template --</option>
              {interviews.map((i) => (
                <option key={i._id || i.id} value={i._id || i.id}>
                  {i.title} ({i.jobRole})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Candidate Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. Python, Docker, PostgreSQL, React"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
            >
              {creating ? 'Enrolling Candidate...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Candidate Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>
              Are you sure you want to delete candidate <strong>{selectedCandidate?.name}</strong>? This action will permanently remove all associated interview responses, AI evaluations, and final reports.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCandidate}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
            >
              Delete Candidate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateManagement;
