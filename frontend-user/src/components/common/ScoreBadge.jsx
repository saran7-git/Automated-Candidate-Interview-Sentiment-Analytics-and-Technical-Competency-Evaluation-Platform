import React from 'react';

export const ScoreBadge = ({ score = 0, showPercent = true, size = 'md' }) => {
  const num = Math.round(score);
  let bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  if (num >= 84) {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (num >= 70) {
    bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (num >= 55) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else {
    bg = 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span className={`inline-flex items-center justify-center rounded-lg border ${bg} ${sizeClasses[size] || sizeClasses.md}`}>
      {num}{showPercent ? '%' : ''}
    </span>
  );
};

export const RecommendationBadge = ({ recommendation = 'Pending' }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  if (recommendation.includes('Strong') || recommendation.includes('Hire')) {
    style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (recommendation.includes('Good')) {
    style = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  } else if (recommendation.includes('Consider') || recommendation.includes('Reservations')) {
    style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (recommendation.includes('Improvement') || recommendation.includes('Not')) {
    style = 'bg-red-500/10 text-red-400 border-red-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {recommendation}
    </span>
  );
};

export default ScoreBadge;
