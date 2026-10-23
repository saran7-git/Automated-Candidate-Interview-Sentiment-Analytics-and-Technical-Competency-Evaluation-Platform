import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className="text-slate-400">{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
