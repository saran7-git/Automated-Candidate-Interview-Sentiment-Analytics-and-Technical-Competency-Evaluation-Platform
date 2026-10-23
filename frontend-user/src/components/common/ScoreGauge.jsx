import React from 'react';

export const ScoreGauge = ({ score = 0, size = 180, strokeWidth = 14, label = 'Overall Score' }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = '#3b82f6'; // Blue
  let textClass = 'text-blue-400';
  let badgeLabel = 'Good Candidate';
  let badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  if (normalizedScore >= 84) {
    colorClass = '#10b981'; // Emerald
    textClass = 'text-emerald-400';
    badgeLabel = 'Strong Performance';
    badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (normalizedScore >= 70) {
    colorClass = '#3b82f6';
    textClass = 'text-blue-400';
    badgeLabel = 'Good Candidate';
    badgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (normalizedScore >= 55) {
    colorClass = '#f59e0b'; // Amber
    textClass = 'text-amber-400';
    badgeLabel = 'Consider with Reservations';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else {
    colorClass = '#ef4444'; // Red
    textClass = 'text-red-400';
    badgeLabel = 'Needs Improvement';
    badgeBg = 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${textClass}`}>
            {normalizedScore}%
          </span>
          <span className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full border ${badgeBg}`}>
        {badgeLabel}
      </div>
    </div>
  );
};

export default ScoreGauge;
