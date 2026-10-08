import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorSchemes = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
