import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const SentimentPieChart = ({ data }) => {
  // If data is array (admin format) or object (candidate format)
  let chartData = [];
  if (Array.isArray(data)) {
    chartData = data;
  } else if (data && typeof data === 'object') {
    chartData = [
      { name: 'Positive', value: data.positive || 0, color: '#10b981' },
      { name: 'Neutral', value: data.neutral || 0, color: '#38bdf8' },
      { name: 'Negative', value: data.negative || 0, color: '#f43f5e' },
    ];
  }

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No sentiment data available.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
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
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value}%`, 'Sentiment Share']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span className="text-slate-300 text-xs font-medium mr-2">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
