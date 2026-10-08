import React from 'react';

export const ScoreBadge = ({ score, size = 'md', label = '' }) => {
  if (score === null || score === undefined) {
    return <span className="text-slate-400 text-xs italic">N/A</span>;
  }

  const num = Number(score);
  let color = 'bg-slate-100 text-slate-700 border-slate-200';

  if (num >= 80) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (num >= 70) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (num >= 50) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-base font-bold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${color} ${sizeClass}`}>
      <span>{num}</span>
      {label && <span className="opacity-75 font-normal">/ {label}</span>}
    </span>
  );
};

export const RecommendationBadge = ({ recommendation }) => {
  if (!recommendation) return null;

  const rec = String(recommendation);
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (rec === 'Strong Hire') {
    style = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  } else if (rec === 'Recommended') {
    style = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
  } else if (rec === 'Consider with Reservations') {
    style = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
  } else {
    style = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${style}`}>
      {rec}
    </span>
  );
};

export default ScoreBadge;
