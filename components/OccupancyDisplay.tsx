import React from 'react';
import { User, Users, CalendarClock } from 'lucide-react';
import { CrowdLevel } from '../types';

interface OccupancyDisplayProps {
  currentMembers: number;
  maxCapacity: number;
  isPredicted?: boolean;
}

const OccupancyDisplay: React.FC<OccupancyDisplayProps> = ({ currentMembers, maxCapacity, isPredicted = false }) => {
  const percentage = Math.round((currentMembers / maxCapacity) * 100);

  let statusColor = 'text-green-500';
  let statusBg = 'bg-green-100';
  let progressColor = 'bg-green-500';
  let statusText = CrowdLevel.LOW;

  if (percentage >= 50 && percentage < 75) {
    statusColor = 'text-yellow-600';
    statusBg = 'bg-yellow-100';
    progressColor = 'bg-yellow-500';
    statusText = CrowdLevel.MODERATE;
  } else if (percentage >= 75 && percentage < 90) {
    statusColor = 'text-orange-600';
    statusBg = 'bg-orange-100';
    progressColor = 'bg-orange-500';
    statusText = CrowdLevel.HIGH;
  } else if (percentage >= 90) {
    statusColor = 'text-red-600';
    statusBg = 'bg-red-100';
    progressColor = 'bg-red-600';
    statusText = CrowdLevel.CROWDED;
  }

  // Calculate Dash Offset for SVG Circle
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`rounded-2xl shadow-sm border p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 ${isPredicted ? 'bg-slate-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
      
      {isPredicted && (
        <div className="absolute top-0 left-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-bold py-1 text-center">
          PREDICTED VIEW
        </div>
      )}

      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Users size={120} />
      </div>

      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 mt-2 ${isPredicted ? 'text-indigo-900' : 'text-slate-500'}`}>
        {isPredicted ? 'Predicted Occupancy' : 'Live Gym Occupancy'}
      </h2>

      <div className="relative w-48 h-48 flex items-center justify-center mb-4">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className={isPredicted ? "text-slate-200" : "text-slate-100"}
          />
          {/* Progress Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${statusColor} transition-all duration-1000 ease-in-out ${isPredicted ? 'opacity-70' : 'opacity-100'}`}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${statusColor}`}>{percentage}%</span>
          <span className="text-slate-400 text-sm font-medium mt-1">Capacity</span>
        </div>
      </div>

      <div className={`px-4 py-1.5 rounded-full ${statusBg} ${statusColor} text-sm font-bold mb-4 flex items-center gap-2`}>
        {!isPredicted && <div className={`w-2 h-2 rounded-full ${progressColor} animate-pulse`} />}
        {isPredicted && <CalendarClock size={14} />}
        {statusText} Usage
      </div>

      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isPredicted ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-50 text-slate-600'}`}>
        <User size={18} />
        <span className="font-semibold">{currentMembers}</span>
        <span className="text-slate-400">/ {maxCapacity} Members {isPredicted ? 'Expected' : 'Active'}</span>
      </div>
    </div>
  );
};

export default OccupancyDisplay;