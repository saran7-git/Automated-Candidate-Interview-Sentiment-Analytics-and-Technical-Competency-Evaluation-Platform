import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const QuestionModal = ({ isOpen, onClose, onSave, question = null }) => {
  const [formData, setFormData] = useState({
    question: '',
    domain: 'JavaScript',
    skill: '',
    difficulty: 'Medium',
    expectedConcepts: '',
    keywords: '',
    sampleAnswer: '',
    marks: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        domain: question.domain || 'JavaScript',
        skill: question.skill || '',
        difficulty: question.difficulty || 'Medium',
        expectedConcepts: Array.isArray(question.expectedConcepts)
          ? question.expectedConcepts.join(', ')
          : question.expectedConcepts || '',
        keywords: Array.isArray(question.keywords)
          ? question.keywords.join(', ')
          : question.keywords || '',
        sampleAnswer: question.sampleAnswer || '',
        marks: question.marks || 10,
      });
    } else {
      setFormData({
        question: '',
        domain: 'JavaScript',
        skill: '',
        difficulty: 'Medium',
        expectedConcepts: '',
        keywords: '',
        sampleAnswer: '',
        marks: 10,
      });
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.skill || !formData.sampleAnswer) {
      setError('Please fill in question text, skill category, and sample answer.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      expectedConcepts: formData.expectedConcepts.split(',').map((c) => c.trim()).filter(Boolean),
      keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      marks: Number(formData.marks) || 10,
    };

    const success = await onSave(payload, question?._id);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const domains = ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'SQL', 'Python', 'Java', 'General'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">
              {question ? 'Edit Technical Question' : 'Create New Technical Question'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add expected concepts and keywords for automated NLP evaluation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Question Text *
            </label>
            <textarea
              rows={3}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. What is the Virtual DOM in React and how does reconciliation work?"
              required
              className="w-full p-3 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Domain *
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Skill Area *
              </label>
              <input
                type="text"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                placeholder="e.g. State Management"
                required
                className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Expected Concepts (Comma-separated) *
            </label>
            <input
              type="text"
              value={formData.expectedConcepts}
              onChange={(e) => setFormData({ ...formData, expectedConcepts: e.target.value })}
              placeholder="virtual dom, diffing algorithm, reconciliation, real dom update"
              required
              className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Concepts candidates must explain for maximum technical score.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="vdom, diffing, batching, render"
              className="w-full p-2.5 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase mb-1">
              Sample Model Answer *
            </label>
            <textarea
              rows={3}
              value={formData.sampleAnswer}
              onChange={(e) => setFormData({ ...formData, sampleAnswer: e.target.value })}
              placeholder="The Virtual DOM is an in-memory representation..."
              required
              className="w-full p-3 bg-dark-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{question ? 'Update Question' : 'Save Question'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
