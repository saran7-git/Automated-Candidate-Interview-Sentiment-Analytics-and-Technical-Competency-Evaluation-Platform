import React from 'react';
import { SlidersHorizontal, Terminal, BrainCircuit, LineChart } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Interview',
      desc: 'Define role criteria, customize domain (React, Node, SQL), difficulty tier, and assessment length.',
      icon: SlidersHorizontal,
    },
    {
      num: '02',
      title: 'Candidate Responds',
      desc: 'Candidates enter a focused assessment room, answering questions under timed conditions.',
      icon: Terminal,
    },
    {
      num: '03',
      title: 'AI Analyzes',
      desc: 'Our NLP pipeline evaluates concept coverage, relevance, and communication sentiment in real-time.',
      icon: BrainCircuit,
    },
    {
      num: '04',
      title: 'Recruiter Gets Insights',
      desc: 'Recruiters review objective score breakdowns, candidate rankings, and actionable recommendation badges.',
      icon: LineChart,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-slate-800/80 bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Process</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How InterviewIQ Works
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            From assessment setup to candidate ranking in four streamlined steps.
          </p>
        </div>

        {/* Horizontal Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-blue-500/80">{step.num}</span>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
