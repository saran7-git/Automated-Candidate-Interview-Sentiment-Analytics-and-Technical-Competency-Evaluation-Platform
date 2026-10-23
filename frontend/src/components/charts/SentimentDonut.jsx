import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const SentimentDonut = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Positive', value: 65, color: '#10b981' },
    { name: 'Neutral', value: 25, color: '#6366f1' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ];

  return (
    <div className="w-full h-72 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, 'Proportion']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-5 text-xs text-slate-400">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name} ({item.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentDonut;
