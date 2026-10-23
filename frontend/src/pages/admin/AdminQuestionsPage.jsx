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
    setFormData({
      question: q.question,
      category: q.category,
      skill: q.skill,
      difficulty: q.difficulty,
      expected_answer: q.expected_answer,
      expected_concepts: Array.isArray(q.expected_concepts) ? q.expected_concepts.join(', ') : (q.expected_concepts || ''),
      keywords: Array.isArray(q.keywords) ? q.keywords.join(', ') : (q.keywords || ''),
      max_score: q.max_score || 10,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await questionAPI.deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        expected_concepts: formData.expected_concepts.split(',').map((c) => c.trim()).filter(Boolean),
        keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      };

      if (editingId) {
        await questionAPI.updateQuestion(editingId, payload);
      } else {
        await questionAPI.createQuestion(payload);
      }

      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131b2e] border border-slate-800 rounded-3xl p-6 md:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curate technical questions, concept matching tags, and model answers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by prompt or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 text-xs text-slate-300 font-semibold outline-none focus:border-blue-500 transition-all"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#131b2e] border border-slate-800 text-xs text-slate-300 font-semibold outline-none focus:border-blue-500 transition-all"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading questions bank...</div>
        ) : questions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-5">Question</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Skill</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Max Score</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-white max-w-md">
                      <p className="line-clamp-2">{q.question}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700/60">
                        {q.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{q.skill}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        q.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-300">{q.max_score || 10} pts</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Technical Question' : 'Add New Question'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Question Prompt
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. Explain the difference between authentication and authorization."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Skill Tag
                </label>
                <input
                  type="text"
                  required
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  placeholder="e.g. Virtual DOM & Reconciliation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Expected Model Answer
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.expected_answer}
                  onChange={(e) => setFormData({ ...formData, expected_answer: e.target.value })}
                  placeholder="Reference answer used for semantic relevance matching..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Key Concepts (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.expected_concepts}
                  onChange={(e) => setFormData({ ...formData, expected_concepts: e.target.value })}
                  placeholder="e.g. virtual dom, diffing algorithm, reconciliation, batching"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue flex items-center justify-center gap-1.5"
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
