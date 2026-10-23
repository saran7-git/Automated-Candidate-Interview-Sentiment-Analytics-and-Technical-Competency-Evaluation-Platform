import React from 'react';

export const AudioVisualizer = ({ level = 0, bands = [], isWorking = false, barCount = 12 }) => {
  const bars = bands && bands.length > 0
    ? bands.slice(0, barCount)
    : Array.from({ length: barCount }, (_, i) => {
        if (!isWorking || level === 0) return 6;
        // Generate animated dynamic height based on overall level
        const factor = Math.sin((i / barCount) * Math.PI) * 0.8 + 0.2;
        return Math.max(8, Math.min(100, Math.round(level * factor * (0.6 + Math.random() * 0.4))));
      });

  return (
    <div className="flex items-end gap-1 h-8 px-2 py-1 bg-dark-900/80 rounded-lg border border-slate-700/50">
      {bars.map((height, idx) => (
        <div
          key={idx}
          className={`w-1 rounded-full transition-all duration-75 ${
            isWorking && height > 15
              ? height > 70
                ? 'bg-emerald-400'
                : height > 40
                ? 'bg-teal-400'
                : 'bg-brand-500'
              : 'bg-slate-600'
          }`}
          style={{ height: `${Math.max(10, height)}%` }}
        />
      ))}
    </div>
  );
};
