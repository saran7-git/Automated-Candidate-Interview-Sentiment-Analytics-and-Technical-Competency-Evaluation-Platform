import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Brain, Cpu, MessageSquare } from 'lucide-react';

export const DashboardPreview = () => {
  return (
    <div className="relative mx-auto w-full max-w-4xl rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-4 md:p-6 overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Mockup Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs font-bold text-slate-300">Candidate Performance Audit: Sri Balaji</span>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          Strong Performance (84%)
        </span>
      </div>

      {/* Grid of Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Metric 1 */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Overall Score</span>
            <Brain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">84%</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">✓ Top 5% in React & SQL</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Technical Competency</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">86%</div>
          <div className="text-[11px] text-blue-400 font-medium mt-1">60% Weighting Applied</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Communication Sentiment</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">78%</div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">High Clarity & Confidence</div>
        </div>
      </div>

      {/* Simulated Question Analysis Strip */}
      <div className="bg-[#131b2e] border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200">Question 01: Virtual DOM & Reconciliation in React</span>
          <span className="text-xs font-extrabold text-emerald-400">Score: 90%</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Virtual DOM
          </span>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Diffing Algorithm
          </span>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Batching
          </span>
          <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
            Sentiment: Positive
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
