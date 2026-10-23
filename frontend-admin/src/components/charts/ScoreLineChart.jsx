import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const ScoreLineChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No interview score history recorded yet.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            stroke="#475569"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            stroke="#475569"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="overallScore"
            name="Overall Score"
            stroke="#14b8a6"
            strokeWidth={3}
            dot={{ fill: '#14b8a6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="technicalScore"
            name="Technical Competency"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ fill: '#38bdf8', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="sentimentScore"
            name="Communication/Sentiment"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="2 2"
            dot={{ fill: '#a855f7', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
