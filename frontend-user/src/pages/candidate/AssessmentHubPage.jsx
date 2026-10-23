import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../../services/api';
import {
  Brain,
  Cpu,
  BookOpen,
  Calculator,
  Code2,
  Clock,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Award,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AssessmentHubPage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(false);
    try {
      const res = await assessmentAPI.getSections();
      if (res.data?.success) {
        setSections(res.data.sections);
      }
    } catch (err) {
      console.warn('Using default section structure:', err.message);
      // Fallback default structure
      setSections([
        {
          id: 'aptitude',
          title: 'Aptitude Assessment',
          category: 'aptitude',
          durationMinutes: 30,
          totalQuestions: 20,
          description: 'Quantitative aptitude, arithmetic logic, percentages, ratios, and data interpretation.',
          status: 'not_started',
          score: 0,
          maxScore: 20,
          percentage: 0,
        },
        {
          id: 'logical_reasoning',
          title: 'Logical Reasoning Assessment',
          category: 'logical_reasoning',
          durationMinutes: 30,
          totalQuestions: 20,
          description: 'Analytical deductions, series completion, coding-decoding, syllogisms, and seating arrangements.',
          status: 'not_started',
          score: 0,
          maxScore: 20,
          percentage: 0,
        },
        {
          id: 'verbal_ability',
          title: 'Verbal Ability Assessment',
          category: 'verbal_ability',
          durationMinutes: 30,
          totalQuestions: 20,
          description: 'Grammar, subject-verb agreement, vocabulary, error spotting, and reading comprehension.',
          status: 'not_started',
          score: 0,
          maxScore: 20,
          percentage: 0,
        },
        {
          id: 'numerical_reasoning',
          title: 'Numerical Reasoning Assessment',
          category: 'numerical_reasoning',
          durationMinutes: 30,
          totalQuestions: 20,
          description: 'Number patterns, quantitative comparisons, business calculations, and estimation logic.',
          status: 'not_started',
          score: 0,
          maxScore: 20,
          percentage: 0,
        },
        {
          id: 'coding',
          title: 'Online Coding Assessment',
          category: 'coding',
          durationMinutes: 60,
          totalQuestions: 2,
          description: 'Two algorithmic challenges in C, C++, Python, Java, or MySQL with live compiler execution.',
          status: 'not_started',
          score: 0,
          maxScore: 20,
          percentage: 0,
        },
      ]);
    }
  };

  const getSectionIcon = (id) => {
    switch (id) {
      case 'aptitude':
        return <Brain className="w-5 h-5 text-teal-600" />;
      case 'logical_reasoning':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'verbal_ability':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'numerical_reasoning':
        return <Calculator className="w-5 h-5 text-cyan-600" />;
      case 'coding':
        return <Code2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Brain className="w-5 h-5 text-teal-600" />;
    }
  };

  const handleStart = (section) => {
    if (section.id === 'coding') {
      navigate('/assessment/coding', { state: { section } });
    } else {
      navigate(`/assessment/objective/${section.id}`, { state: { section } });
    }
  };

  const totalSections = sections.length || 5;
  const completedSections = sections.filter((s) => s.status === 'completed').length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="space-y-6">
      {/* Enterprise Header Banner */}
      <div className="bg-[#0f172a] text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recruitment Assessment Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Standardized Technical & Analytical Assessment Suite
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Complete the five evaluation modules below under timed conditions. Your submissions are evaluated against verified benchmarks and combined with proctored telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>4 Objective Sections (30m each) + 1 Coding Section (60m)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>80 Objective Questions + 2 Programming Problems</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Widget */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center font-bold text-teal-400 text-base shadow-inner">
              {completionPercentage}%
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Overall Assessment Progress</div>
              <div className="text-xs text-slate-400">
                {completedSections} of {totalSections} assessment modules completed
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assessment Section Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Assessment Modules ({totalSections})</h2>
          <span className="text-xs text-slate-500 font-medium">Server-Authoritative Timers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {sections.map((section, idx) => {
            const isCompleted = section.status === 'completed';
            const isInProgress = section.status === 'in_progress';

            return (
              <div
                key={section.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-2xs">
                      {getSectionIcon(section.id)}
                    </div>
                    {isCompleted ? (
                      <span className="badge-emerald flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed ({section.percentage || 0}%)
                      </span>
                    ) : isInProgress ? (
                      <span className="badge-amber flex items-center gap-1.5 text-[11px]">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        In Progress
                      </span>
                    ) : (
                      <span className="badge-navy text-[11px]">Section {idx + 1}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-1.5">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[36px]">
                    {section.description}
                  </p>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Allocated Duration:
                      </span>
                      <span className="font-semibold text-slate-800">{section.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        Total Questions:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {section.id === 'coding' ? '2 Problems' : `${section.totalQuestions} MCQs`}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          Achieved Score:
                        </span>
                        <span className="font-bold text-emerald-700">
                          {section.score} / {section.maxScore} ({section.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <button
                      onClick={() => handleStart(section)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      <span>Review Section Results</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(section)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isInProgress
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{isInProgress ? 'Resume Assessment' : 'Start Assessment'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proctoring & Integrity Notice */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed">
          <span className="font-bold">Proctored Assessment Notice: </span>
          All objective assessments and coding challenges operate under server-authoritative timers. Navigating away from the window or switching tabs is logged in the proctoring audit trail. Responses are autosaved continuously.
        </div>
      </div>
    </div>
  );
};

export default AssessmentHubPage;
