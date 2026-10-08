import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import {
  ClipboardList,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Database',
  'Networking',
  'Operating Systems',
  'Data Structures',
  'AI/ML',
  'General Technical',
  'HR/Behavioral'
];

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [creating, setCreating] = useState(false);

  // New Interview Form
  const [formData, setFormData] = useState({
    title: '',
    jobRole: '',
    description: '',
    duration: 30,
    difficulty: 'Intermediate',
    questions: [
      {
        question: '',
        category: 'Programming',
        difficulty: 'Medium',
        expectedAnswer: '',
        keywords: '',
        maxScore: 10
      }
    ]
  });

  const { success, error } = useToast();

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewAPI.getAll();
      setInterviews(res.interviews || []);
    } catch (err) {
      error(err.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionField = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          category: 'Programming',
          difficulty: 'Medium',
          expectedAnswer: '',
          keywords: '',
          maxScore: 10
        }
      ]
    }));
  };

  const handleRemoveQuestionField = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionFieldChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      updated[index][field] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.jobRole) {
      error('Title and Job Role are required');
      return;
    }

    if (formData.questions.length === 0 || !formData.questions[0].question) {
      error('Please add at least one question with question text.');
      return;
    }

    try {
      setCreating(true);
      const processedQuestions = formData.questions.map((q) => ({
        ...q,
        keywords: typeof q.keywords === 'string'
          ? q.keywords.split(',').map((s) => s.trim()).filter(Boolean)
          : q.keywords
      }));

      await interviewAPI.create({
        ...formData,
        questions: processedQuestions
      });

      success('New interview template successfully created!');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        jobRole: '',
        description: '',
        duration: 30,
        difficulty: 'Intermediate',
        questions: [
          {
            question: '',
            category: 'Programming',
            difficulty: 'Medium',
            expectedAnswer: '',
            keywords: '',
            maxScore: 10
          }
        ]
      });
      loadInterviews();
    } catch (err) {
      error(err.message || 'Failed to create interview');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInterview = async () => {
    if (!selectedInterview) return;
    try {
      await interviewAPI.delete(selectedInterview._id || selectedInterview.id);
      success('Interview deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedInterview(null);
      loadInterviews();
    } catch (err) {
      error(err.message || 'Failed to delete interview');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading interview templates..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Define interview roles, create technical questions, and calibrate expected concepts and keywords.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Interview</span>
        </button>
      </div>

      {/* Interviews Grid / Cards */}
      <div className="grid grid-cols-1 gap-5">
        {interviews.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
            No interview templates available. Click "Create New Interview" to define one.
          </div>
        ) : (
          interviews.map((intr) => {
            const iId = intr._id || intr.id;
            const isExpanded = expandedId === iId;
            const questions = intr.questions || [];

            return (
              <div
                key={iId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {intr.difficulty || 'Intermediate'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {intr.jobRole}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {intr.duration} Mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{intr.title}</h3>
                    {intr.description && (
                      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                        {intr.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : iId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>{questions.length} Questions</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedInterview(intr);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                      title="Delete Interview"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Interview Questions ({questions.length})
                    </h4>
                    <div className="space-y-3">
                      {questions.map((q, idx) => (
                        <div
                          key={q._id || q.id || idx}
                          className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-700">
                              Question {idx + 1} • {q.category}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Max {q.maxScore || 10} pts
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900 text-sm">{q.question}</div>
                          {q.expectedAnswer && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-600 text-[11px]">
                              <span className="font-bold text-slate-700">Expected Reference: </span>
                              {q.expectedAnswer}
                            </div>
                          )}
                          {q.keywords && q.keywords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">Keywords:</span>
                              {(Array.isArray(q.keywords) ? q.keywords : []).map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Interview Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Interview Template"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateInterview} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Interview Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full-Stack Engineer Assessment"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Job Role *
              </label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                placeholder="e.g. Backend Cloud Engineer"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of skills, architecture questions, and behavioral expectations evaluated."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Dynamic Questions Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Question Items ({formData.questions.length})
              </h4>
              <button
                type="button"
                onClick={handleAddQuestionField}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {formData.questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">Question #{idx + 1}</span>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestionField(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionFieldChange(idx, 'question', e.target.value)}
                      placeholder="Question prompt, e.g. What is database normalization?"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={q.category}
                        onChange={(e) => handleQuestionFieldChange(idx, 'category', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Key Concepts / Keywords (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={q.keywords}
                        onChange={(e) => handleQuestionFieldChange(idx, 'keywords', e.target.value)}
                        placeholder="e.g. redundancy, anomalies, 1NF, 2NF"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Expected Answer / Model Reference
                    </label>
                    <textarea
                      rows={2}
                      value={q.expectedAnswer}
                      onChange={(e) => handleQuestionFieldChange(idx, 'expectedAnswer', e.target.value)}
                      placeholder="Comprehensive model answer used by AI evaluation pipeline for correctness and completeness matching."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
            >
              {creating ? 'Saving Template...' : 'Save Interview Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Interview Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>
              Are you sure you want to delete template <strong>{selectedInterview?.title}</strong>?
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
              onClick={handleDeleteInterview}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
            >
              Delete Template
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewManagement;
