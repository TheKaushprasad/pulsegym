import React from 'react';
import { EquipmentCategory, EquipmentStatus } from '../types';
import { Settings, RefreshCw, Save } from 'lucide-react';

interface AdminPanelProps {
  currentMembers: number;
  maxCapacity: number;
  equipment: EquipmentCategory[];
  onUpdateOccupancy: (count: number) => void;
  onUpdateEquipment: (id: string, status: EquipmentStatus) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  currentMembers,
  maxCapacity,
  equipment,
  onUpdateOccupancy,
  onUpdateEquipment
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-blue-400" />
            Admin Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage live data and sensor overrides</p>
        </div>
        <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          System Live
        </div>
      </div>

      <div className="p-6 grid gap-8 md:grid-cols-2">
        {/* Occupancy Control */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Live Access Gate Control</h3>
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
            <div className="flex justify-between items-end mb-4">
               <div>
                 <p className="text-slate-400 text-xs mb-1">Current Headcount</p>
                 <p className="text-3xl font-mono font-bold text-white">{currentMembers}</p>
               </div>
               <div className="text-right">
                 <p className="text-slate-400 text-xs mb-1">Utilization</p>
                 <p className="text-xl font-bold text-blue-400">{Math.round((currentMembers/maxCapacity)*100)}%</p>
               </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max={maxCapacity}
                value={currentMembers}
                onChange={(e) => onUpdateOccupancy(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => onUpdateOccupancy(Math.max(0, currentMembers - 5))}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg text-sm transition-colors"
                >
                  -5 Exit
                </button>
                <button 
                  onClick={() => onUpdateOccupancy(Math.min(maxCapacity, currentMembers + 5))}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  +5 Entry
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Equipment Control */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Equipment Status Override</h3>
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {equipment.map((item) => (
                <div key={item.id} className="p-4 border-b border-slate-700 last:border-0 flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <select
                    value={item.status}
                    onChange={(e) => onUpdateEquipment(item.id, e.target.value as EquipmentStatus)}
                    className="bg-slate-900 border border-slate-600 text-sm rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {Object.values(EquipmentStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-700/50 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
               <RefreshCw size={12} /> Auto-sync enabled for sensors
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;