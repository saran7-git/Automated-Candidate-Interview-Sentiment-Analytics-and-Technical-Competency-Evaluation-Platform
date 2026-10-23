import React, { useState, useEffect } from 'react';
import { questionAPI } from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  CheckCircle2,
  Save,
  Shield,
} from 'lucide-react';

const CATEGORIES = [
  'React', 'JavaScript', 'Node.js', 'SQL', 'DBMS',
  'Data Structures', 'Algorithms', 'OOP', 'Operating Systems',
  'Computer Networks', 'Python', 'Java', 'C/C++'
];

export const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    category: 'React',
    skill: '',
    difficulty: 'Medium',
    expected_answer: '',
    expected_concepts: '',
    keywords: '',
    max_score: 10,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await questionAPI.getQuestions({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        search,
      });
      if (res.data?.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error('[Questions Fetch Error]:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      question: '',
      category: 'React',
      skill: '',
      difficulty: 'Medium',
      expected_answer: '',
      expected_concepts: '',
      keywords: '',
      max_score: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    let concepts = q.expected_concepts;
    if (Array.isArray(concepts)) concepts = concepts.join(', ');
    else if (typeof concepts === 'string') {
      try {
        const parsed = JSON.parse(concepts);
        if (Array.isArray(parsed)) concepts = parsed.join(', ');
      } catch (e) {}
    }

    setFormData({
      question: q.question,
      category: q.category,
      skill: q.skill || '',
      difficulty: q.difficulty || 'Medium',
      expected_answer: q.expected_answer || '',
      expected_concepts: concepts || '',
      keywords: '',
      max_score: q.max_score || 10,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technical interview question?')) {
      return;
    }

    try {
      await questionAPI.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        expected_concepts: formData.expected_concepts
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        keywords: formData.expected_concepts
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
      };

      if (editingId) {
        const res = await questionAPI.updateQuestion(editingId, payload);
        if (res.data?.success) {
          setQuestions((prev) => prev.map((q) => (q.id === editingId ? res.data.question : q)));
        }
      } else {
        const res = await questionAPI.createQuestion(payload);
        if (res.data?.success) {
          setQuestions((prev) => [res.data.question, ...prev]);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Recruiter Assessment Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Technical Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Curate technical questions, concept matching tags, difficulty ratings, and reference answers for AI evaluation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by prompt or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all shadow-2xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-teal-600 transition-all shadow-2xs"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-teal-600 transition-all shadow-2xs"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading questions bank...</div>
        ) : questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/75">
                  <th className="py-3.5 px-5">Question</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Skill</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Max Marks</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-900 max-w-md">
                      <p className="line-clamp-2">{q.question}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {q.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{q.skill}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          q.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">{q.max_score || 10} pts</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
              icon={HelpCircle}
              title="No questions in this filter"
              description="Try adjusting your category or difficulty search criteria."
              actionText="Add New Question"
              onAction={handleOpenCreate}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingId ? 'Edit Technical Question' : 'Add New Question'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Prompt
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. Explain the difference between authentication and authorization."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-teal-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-teal-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-teal-600"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Skill Tag
                </label>
                <input
                  type="text"
                  required
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  placeholder="e.g. Virtual DOM & Reconciliation"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Model Answer
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.expected_answer}
                  onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
                  placeholder="Reference answer used for semantic relevance matching..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-teal-600 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Concepts (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.expected_concepts}
                  onChange={(e) => setFormData({ ...formData, expected_concepts: e.target.value })}
                  placeholder="e.g. virtual dom, diffing algorithm, reconciliation, batching"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{formLoading ? 'Saving...' : 'Save Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionsPage;
