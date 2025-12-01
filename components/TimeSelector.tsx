import React from 'react';
import { Clock } from 'lucide-react';
import { CrowdDataPoint } from '../types';

interface TimeSelectorProps {
  forecastData: CrowdDataPoint[];
  selectedTime: string; // 'Now' or the time string e.g. '14:00'
  onSelectTime: (time: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ forecastData, selectedTime, onSelectTime }) => {
  // Filter for 'Now' and future times only
  const futureData = forecastData.filter(d => d.time === 'Now' || d.isPredicted);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-3 text-slate-800">
        <Clock size={18} className="text-blue-600" />
        <h3 className="font-bold text-sm uppercase tracking-wide">Plan Your Visit</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {futureData.map((point, index) => {
          const isSelected = selectedTime === point.time;
          const isNow = point.time === 'Now';
          
          return (
            <button
              key={index}
              onClick={() => onSelectTime(point.time)}
              className={`
                flex flex-col items-center justify-center min-w-[80px] p-2 rounded-xl border transition-all
                ${isSelected 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' 
                  : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-white'
                }
              `}
            >
              <span className={`text-xs font-bold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {isNow ? 'LIVE' : point.time}
              </span>
              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                {Math.round(point.occupancyPercentage)}%
              </span>
            </button>
          );
        })}
      </div>
      {selectedTime !== 'Now' && (
        <div className="mt-3 text-center text-xs text-slate-500 bg-slate-50 py-2 rounded-lg border border-slate-100 animate-in fade-in">
          Viewing predicted data for <span className="font-bold text-slate-700">{selectedTime}</span> based on historical trends.
        </div>
      )}
    </div>
  );
};

export default TimeSelector;