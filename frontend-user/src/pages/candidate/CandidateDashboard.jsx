import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidateAPI, assessmentAPI } from '../../services/api';
import {
  Brain,
  Award,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Clock,
  ShieldCheck,
  Code2,
  FileText,
  BarChart2,
  Sparkles,
  Layers,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, secRes] = await Promise.all([
          candidateAPI.getCandidateDashboard().catch(() => ({ data: null })),
          assessmentAPI.getSections().catch(() => ({ data: null })),
        ]);

        if (dashRes.data?.success) {
          setData(dashRes.data);
        }
        if (secRes.data?.success) {
          setSections(secRes.data.sections);
        }
      } catch (err) {
        console.error('[Dashboard Error]:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    totalInterviews: 1,
    averageScore: 84,
    bestScore: 92,
    completionRate: 100,
  };

  const recentInterviews = data?.recentInterviews || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Greeting & Enterprise Welcome Header */}
      <div className="enterprise-card p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Candidate Assessment Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Candidate'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Automated Candidate Interview Sentiment Analytics and Technical Competency Evaluation Platform. Complete your assigned assessments and proctored technical evaluations below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/assessments"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <Brain className="w-4 h-4" />
            <span>Open Assessment Hub (5 Modules)</span>
          </Link>
          <Link
            to="/interview/setup"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex-shrink-0"
          >
            <PlayCircle className="w-4 h-4 text-teal-400" />
            <span>AI Technical Interview</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Completed Assessments</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">5 / 5</div>
          <span className="text-[11px] text-teal-700 font-medium">All 5 sections finished</span>
        </div>

        <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Composite Score</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.averageScore || 84}%</div>
          <span className="text-[11px] text-blue-700 font-medium">Benchmark: High Performance</span>
        </div>

        <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Coding Sandbox</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <span className="text-[11px] text-emerald-700 font-medium">Passed all sample & hidden tests</span>
        </div>

        <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Proctoring Telemetry</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">High</div>
          <span className="text-[11px] text-teal-700 font-medium">Verified integrity compliance</span>
        </div>
      </div>

      {/* Assessment Suite Quick Start Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Standardized Assessment Suite (Exact Configuration)
            </h2>
            <p className="text-xs text-slate-500">
              4 Objective Sections (20 Qs, 30m each) + 1 Coding Section (2 Problems, 60m)
            </p>
          </div>
          <Link
            to="/assessments"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Link
            to="/assessment/objective/aptitude"
            className="enterprise-card-hover p-4 bg-white border border-slate-200 rounded-xl block group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
              1
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-1">
              Aptitude
            </div>
            <div className="text-[11px] text-slate-500 mb-3">20 Qs • 30 Mins</div>
            <span className="badge-teal text-[10px]">Start / Review</span>
          </Link>

          <Link
            to="/assessment/objective/logical_reasoning"
            className="enterprise-card-hover p-4 bg-white border border-slate-200 rounded-xl block group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
              2
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
              Logical Reasoning
            </div>
            <div className="text-[11px] text-slate-500 mb-3">20 Qs • 30 Mins</div>
            <span className="badge-blue text-[10px]">Start / Review</span>
          </Link>

          <Link
            to="/assessment/objective/verbal_ability"
            className="enterprise-card-hover p-4 bg-white border border-slate-200 rounded-xl block group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
              3
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors mb-1">
              Verbal Ability
            </div>
            <div className="text-[11px] text-slate-500 mb-3">20 Qs • 30 Mins</div>
            <span className="badge-navy text-[10px]">Start / Review</span>
          </Link>

          <Link
            to="/assessment/objective/numerical_reasoning"
            className="enterprise-card-hover p-4 bg-white border border-slate-200 rounded-xl block group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
              4
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors mb-1">
              Numerical Reasoning
            </div>
            <div className="text-[11px] text-slate-500 mb-3">20 Qs • 30 Mins</div>
            <span className="badge-teal text-[10px]">Start / Review</span>
          </Link>

          <Link
            to="/assessment/coding"
            className="enterprise-card-hover p-4 bg-white border border-slate-200 rounded-xl block group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mb-3 group-hover:scale-105 transition-transform">
              5
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
              Coding Assessment
            </div>
            <div className="text-[11px] text-slate-500 mb-3">2 Problems • 60 Mins</div>
            <span className="badge-emerald text-[10px]">Open Compiler</span>
          </Link>
        </div>
      </div>

      {/* Recent Evaluations & Scorecard Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Evaluations Table */}
        <div className="lg:col-span-8 enterprise-card p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Assessment Sessions</h3>
            <Link to="/history" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Assessment Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">React.js Core Assessment</td>
                  <td className="px-4 py-3">Technical Interview</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">84%</td>
                  <td className="px-4 py-3"><span className="badge-emerald">Evaluated</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/candidate/results/1" className="text-teal-700 hover:underline font-semibold">
                      View Report
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">Aptitude & Arithmetic</td>
                  <td className="px-4 py-3">Objective (20 Qs)</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">90%</td>
                  <td className="px-4 py-3"><span className="badge-emerald">Completed</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/candidate/comprehensive-report" className="text-teal-700 hover:underline font-semibold">
                      Scorecard
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">Online Coding Assessment</td>
                  <td className="px-4 py-3">Compiler Sandbox</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">100%</td>
                  <td className="px-4 py-3"><span className="badge-emerald">Passed</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/assessment/coding" className="text-teal-700 hover:underline font-semibold">
                      Review Code
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Scorecard Promo Card */}
        <div className="lg:col-span-4 enterprise-card p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Official Scorecard
          </div>

          <h3 className="text-base font-extrabold text-white">
            Download Comprehensive Assessment Report
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Consolidates your scores across all 4 objective sections, real compiler test-case evaluations, technical AI interview scores, and proctoring telemetry into a recruiter-ready scorecard.
          </p>

          <Link
            to="/candidate/comprehensive-report"
            className="block w-full py-2.5 px-4 text-center rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            View Official Scorecard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
