import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200/80',
    emerald: 'bg-teal-50 text-teal-600 border-teal-200/80',
    purple: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/80',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
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
            <span className={`font-semibold ${trend > 0 ? 'text-teal-600' : 'text-slate-500'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className="text-slate-500 font-medium">{trendLabel || subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
