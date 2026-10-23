import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Play } from 'lucide-react';
import DashboardPreview from './DashboardPreview';

export const Hero = () => {
  return (
    <section className="relative pt-16 pb-20 overflow-hidden text-center">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Product Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 shadow-glow-blue animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smarter Interviews. Better Decisions.</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Evaluate Skills. <br className="hidden sm:inline" />
          Understand Candidates. <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Hire Smarter.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          AI-powered technical interviews that analyze candidate competency, response relevance, and communication patterns — all in one intelligent platform.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-glow-blue flex items-center justify-center gap-2 group"
          >
            Start Interview
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#product"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Explore Platform
          </a>
        </div>

        {/* Dashboard Preview Component */}
        <div id="product" className="pt-4">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
};

export default Hero;
