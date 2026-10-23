import React from 'react';
import {
  Brain,
  MessageSquareHeart,
  Bot,
  FileCheck2,
  BarChart3,
  Layers,
} from 'lucide-react';

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Technical Evaluation',
      description: 'Evaluate candidate answers dynamically based on deep technical concepts, expected keyword density, and prompt relevance.',
      badge: 'Core Engine',
      color: 'blue',
    },
    {
      icon: MessageSquareHeart,
      title: 'Sentiment Analytics',
      description: 'Analyze the emotional tone, clarity, hesitation indicators, and communication patterns of candidate explanations.',
      badge: 'NLP Insights',
      color: 'purple',
    },
    {
      icon: Bot,
      title: 'Automated Interviews',
      description: 'Conduct structured technical assessments 24/7 without requiring manual engineer time for initial screening rounds.',
      badge: 'Automation',
      color: 'emerald',
    },
    {
      icon: FileCheck2,
      title: 'Candidate Reports',
      description: 'Generate granular performance reports complete with 4-pillar score breakdowns, strengths, and areas to improve.',
      badge: 'Reporting',
      color: 'amber',
    },
    {
      icon: BarChart3,
      title: 'Recruiter Analytics',
      description: 'Understand candidate cohorts and compare candidate performance using visual Recharts graphs and distribution curves.',
      badge: 'Recruiter Intelligence',
      color: 'blue',
    },
    {
      icon: Layers,
      title: 'Question Management',
      description: 'Create and curate technical questions across 10+ categories and multiple difficulty tiers with custom concept tagging.',
      badge: 'Customizable Bank',
      color: 'emerald',
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for Modern Hiring Teams
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Everything you need to automate technical screening, eliminate unconscious bias, and identify top engineering talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 hover:border-slate-750 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
