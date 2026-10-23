import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const ScoreDistributionChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: '85 - 100% (High)', value: 45, color: '#10b981' },
    { name: '70 - 84% (Good)', value: 35, color: '#3b82f6' },
    { name: '55 - 69% (Average)', value: 15, color: '#f59e0b' },
    { name: 'Below 55% (Low)', value: 5, color: '#ef4444' },
  ];

  return (
    <div className="w-full h-72 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} Candidates`, 'Count']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
