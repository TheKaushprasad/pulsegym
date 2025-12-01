import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { CrowdDataPoint } from '../types';

interface CrowdChartProps {
  data: CrowdDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPredicted = payload[0].payload.isPredicted;
    return (
      <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-300">
          {isPredicted ? 'Forecast: ' : 'Recorded: '}
          {Math.round(payload[0].value)}%
        </p>
      </div>
    );
  }
  return null;
};

const CrowdChart: React.FC<CrowdChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Crowd Forecast</h3>
          <p className="text-slate-500 text-sm">Predicted usage for upcoming hours</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-20"></div>
            <span className="text-slate-500">History</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-indigo-500 rounded-sm opacity-20"></div>
            <span className="text-slate-500">Prediction</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x="Now" stroke="#fbbf24" strokeDasharray="3 3" label={{ position: 'top', value: 'NOW', fill: '#d97706', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="occupancyPercentage"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsage)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex items-start gap-3">
        <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
        <p className="text-xs text-indigo-900 leading-relaxed">
          <span className="font-semibold">Insight:</span> The gym usually gets busy around 6:00 PM. We recommend visiting before 4:00 PM or after 8:00 PM for a quieter workout.
        </p>
      </div>
    </div>
  );
};

export default CrowdChart;