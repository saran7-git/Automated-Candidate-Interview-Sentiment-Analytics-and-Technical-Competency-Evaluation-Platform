import React from 'react';

export const ScoreBadge = ({ score = 0, showPercent = true, size = 'md', label = '' }) => {
  const num = Math.round(score);
  let bg = 'bg-blue-50 text-blue-700 border-blue-200';

  if (num >= 84) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (num >= 70) {
    bg = 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (num >= 55) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
  } else {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  return (
    <span className={`inline-flex items-center gap-1 justify-center rounded-lg border ${bg} ${sizeClasses[size] || sizeClasses.md}`}>
      {label && <span className="opacity-75 font-normal">{label}</span>}
      <span>{num}{showPercent ? '%' : ''}</span>
    </span>
  );
};

export const RecommendationBadge = ({ recommendation = 'Pending', size = 'md' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (recommendation.includes('Strong') || recommendation.includes('Hire')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (recommendation.includes('Good') || recommendation.includes('Evaluated')) {
    style = 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (recommendation.includes('Consider') || recommendation.includes('Reservations')) {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (recommendation.includes('Improvement') || recommendation.includes('Not')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClass = size === 'lg' ? 'px-3.5 py-1 text-xs font-bold' : 'px-2.5 py-0.5 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${style} ${sizeClass}`}>
      {recommendation}
    </span>
  );
};

export default ScoreBadge;
