import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../services/api';
import {
  Code2,
  Database,
  Server,
  Layers,
  FileCode,
  BrainCircuit,
  Clock,
  HelpCircle,
  ShieldCheck,
  Play,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const TOPICS = [
  { id: 'React', name: 'React.js', icon: Code2, desc: 'Hooks, Virtual DOM, State Management, Reconciliation' },
  { id: 'JavaScript', name: 'JavaScript', icon: FileCode, desc: 'Closures, Event Loop, Scope, Async/Await, Prototypes' },
  { id: 'Node.js', name: 'Node.js', icon: Server, desc: 'Express, Streams, Buffers, libuv, Event-Driven IO' },
  { id: 'SQL', name: 'SQL', icon: Database, desc: 'Joins, Indexing, ACID Transactions, Grouping, CTEs' },
  { id: 'DBMS', name: 'DBMS', icon: Database, desc: 'Normalization, 1NF/2NF/3NF, Locking, Concurrency' },
  { id: 'Data Structures', name: 'Data Structures', icon: Layers, desc: 'Trees, Hash Tables, Linked Lists, Heaps, Stacks' },
  { id: 'Algorithms', name: 'Algorithms', icon: BrainCircuit, desc: 'Divide & Conquer, Dijkstra, QuickSort, Dynamic Programming' },
  { id: 'Python', name: 'Python', icon: FileCode, desc: 'GIL, Generators, OOP, Multiprocessing, Decorators' },
  { id: 'Java', name: 'Java', icon: Server, desc: 'JVM Heap, Garbage Collection, Interfaces, Concurrency' },
];

export const StartInterviewPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('React');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleStart = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await interviewAPI.startInterview({
        category: selectedCategory,
        difficulty,
        questionCount,
        title: `${selectedCategory} ${difficulty} Assessment`,
      });

      if (res.data?.success && res.data?.interview?.id) {
        navigate(`/candidate/interview/active/${res.data.interview.id}`, {
          state: {
            interview: res.data.interview,
            questions: res.data.questions,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
      setIsConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Technical Assessment Setup</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Select Your Domain & Begin
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Our AI assessment engine will generate structured technical questions, analyze your semantic coverage, and measure communication clarity.
        </p>

        {/* Overview Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Questions</div>
              <div className="text-sm font-bold text-white">{questionCount} Questions</div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Time Limit</div>
              <div className="text-sm font-bold text-white">{questionCount * 5} Minutes</div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Difficulty</div>
              <div className="text-sm font-bold text-white">{difficulty}</div>
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xs text-slate-400 font-medium">Evaluation</div>
              <div className="text-sm font-bold text-white">AI NLP Engine</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Select Topic */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">1. Select Technical Domain</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = selectedCategory === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedCategory(topic.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 shadow-glow-blue'
                    : 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                    {topic.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{topic.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Difficulty & Question Volume */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#131b2e] border border-slate-800 rounded-3xl p-6">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            2. Difficulty Tier
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  difficulty === d
                    ? 'bg-blue-600 text-white border-blue-500 shadow-glow-blue'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            3. Question Volume
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setQuestionCount(cnt)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  questionCount === cnt
                    ? 'bg-blue-600 text-white border-blue-500 shadow-glow-blue'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cnt} Questions
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Instructions & Confirmation Button */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-xs text-slate-400">
          <p className="font-bold text-white text-sm">Assessment Instructions</p>
          <p>• Type complete, structured answers highlighting core architecture concepts.</p>
          <p>• Timed session: Each question provides ~5 minutes of allotted formulation time.</p>
          <p>• Instant AI analysis: Scores are calculated immediately upon final submission.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-glow-blue flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Start Interview
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-4">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to begin?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              You are about to start the <strong>{selectedCategory} ({difficulty})</strong> assessment with <strong>{questionCount} questions</strong>.
              Ensure you are in a quiet environment before starting.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleStart}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue flex items-center justify-center gap-2"
              >
                {loading ? 'Starting...' : 'Begin Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartInterviewPage;
