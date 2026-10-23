import React from 'react';

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

export default RecommendationBadge;
