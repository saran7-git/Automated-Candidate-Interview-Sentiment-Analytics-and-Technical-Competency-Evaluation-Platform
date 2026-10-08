import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

export const SentimentBadge = ({ sentiment = 'Neutral', confidence, score }) => {
  const norm = String(sentiment).toLowerCase();

  let style = 'bg-amber-50 text-amber-700 border-amber-200';
  let Icon = Meh;

  if (norm === 'positive') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    Icon = Smile;
  } else if (norm === 'negative') {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = Frown;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{sentiment}</span>
      {confidence !== undefined && (
        <span className="opacity-75 text-[11px] font-normal">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
      {score !== undefined && (
        <span className="opacity-75 text-[11px] font-normal ml-0.5">
          • {score}
        </span>
      )}
    </span>
  );
};

export default SentimentBadge;
