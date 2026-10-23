import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Layers,
  Server,
  Terminal,
  Database,
  FileCode2,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video
} from 'lucide-react';

export const InterviewSetupPage = () => {
  const [selectedDomain, setSelectedDomain] = useState('React.js');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();

  const domains = [
    {
      id: 'JavaScript',
      name: 'JavaScript',
      desc: 'Closures, Event Loop, Scope, Prototypes & Asynchrony',
      icon: Code,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
    },
    {
      id: 'React.js',
      name: 'React.js',
      desc: 'Virtual DOM, Hooks, Reconciliation, State & Memoization',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'Node.js',
      name: 'Node.js',
      desc: 'Architecture, libuv, Streams, Buffers & Clustering',
      icon: Server,
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'Express.js',
      name: 'Express.js',
      desc: 'Routing, Middlewares, Security & Centralized Errors',
      icon: Terminal,
      color: 'from-slate-500/20 to-zinc-500/10 text-slate-300 border-slate-500/30',
    },
    {
      id: 'SQL',
      name: 'SQL',
      desc: 'Joins, Indexing, B-Trees, ACID & Database Normalization',
      icon: Database,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'Python',
      name: 'Python',
      desc: 'CPython GIL, Generators, Decorators & Meta-programming',
      icon: FileCode2,
      color: 'from-blue-500/20 to-sky-500/10 text-blue-300 border-blue-500/30',
    },
    {
      id: 'Java',
      name: 'Java',
      desc: 'JVM Heap Generations, Garbage Collection & Concurrency',
      icon: Coffee,
      color: 'from-orange-500/20 to-red-500/10 text-orange-300 border-orange-500/30',
    },
  ];

  const difficulties = [
    { id: 'Easy', label: 'Easy', timePerQ: '2 mins', badge: 'Foundational concepts & syntax' },
    { id: 'Medium', label: 'Medium', timePerQ: '3 mins', badge: 'Core mechanics & standard patterns' },
    { id: 'Hard', label: 'Hard', timePerQ: '4 mins', badge: 'Internal architecture & edge cases' },
  ];

  const estimatedMinutes = questionCount * (selectedDifficulty === 'Easy' ? 2 : selectedDifficulty === 'Medium' ? 3 : 4);

  const handleProceed = () => {
    // Store setup selections in sessionStorage for the device check and interview initialization
    sessionStorage.setItem(
      'interview_config',
      JSON.stringify({
        domain: selectedDomain,
        difficulty: selectedDifficulty,
        questionCount,
      })
    );
    navigate('/candidate/device-check');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 3: Interview Customization</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Select Your Technical Domain & Difficulty
        </h1>
        <p className="text-sm text-slate-400">
          Configure your evaluation session parameters. After setup, you will verify camera,
          microphone, and screen permissions before starting.
        </p>
      </div>

      {/* 1. Domain Picker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            1. Choose Technical Domain
          </h2>
          <span className="text-xs text-brand-400 font-semibold">{selectedDomain} selected</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((dom) => {
            const Icon = dom.icon;
            const isSelected = selectedDomain === dom.id;

            return (
              <button
                key={dom.id}
                type="button"
                onClick={() => setSelectedDomain(dom.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-dark-900 border-brand-500 ring-2 ring-brand-500/30 shadow-xl shadow-brand-500/10'
                    : 'bg-dark-900/60 border-slate-800 hover:border-slate-700 hover:bg-dark-900/90'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-brand-400">
                    <CheckCircle2 className="w-5 h-5 fill-brand-500 text-dark-950" />
                  </div>
                )}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl border bg-gradient-to-br ${dom.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{dom.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dom.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Difficulty Picker & Question Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            2. Select Difficulty Level
          </h2>
          <div className="space-y-3">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-dark-900 border-brand-500 ring-2 ring-brand-500/30 shadow-lg'
                      : 'bg-dark-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{diff.label}</span>
                      <span className="text-xs text-slate-400">({diff.timePerQ}/question)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{diff.badge}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Count & Estimated Time */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            3. Number of Questions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 15].map((cnt) => {
              const isSelected = questionCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-brand-300 ring-2 ring-brand-500/30'
                      : 'bg-dark-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-2xl font-black">{cnt}</div>
                  <div className="text-[11px] font-semibold opacity-80">Questions</div>
                </button>
              );
            })}
          </div>

          {/* Session Summary Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Estimated Duration:</span>
              <span className="font-bold text-slate-200 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                ~{estimatedMinutes} Minutes
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Required Channels:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <Video className="w-3.5 h-3.5" />
                Camera, Mic & Screen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-6 border-t border-slate-800 flex justify-end">
        <button
          onClick={handleProceed}
          className="px-8 py-4 bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-base transition-all shadow-xl shadow-brand-500/20 hover:scale-[1.02] flex items-center gap-3"
        >
          <span>Continue to Device Check</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
