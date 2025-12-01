import React from 'react';
import { EquipmentCategory, EquipmentStatus } from '../types';
import { Dumbbell, Activity, Boxes, CircleOff, Wrench } from 'lucide-react';

interface EquipmentStatusListProps {
  equipment: EquipmentCategory[];
}

const StatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
  let colorClass = 'bg-slate-100 text-slate-600';

  switch (status) {
    case EquipmentStatus.LOW_USAGE:
      colorClass = 'bg-emerald-100 text-emerald-700';
      break;
    case EquipmentStatus.MODERATE_USAGE:
      colorClass = 'bg-yellow-100 text-yellow-700';
      break;
    case EquipmentStatus.HIGH_USAGE:
      colorClass = 'bg-orange-100 text-orange-700';
      break;
    case EquipmentStatus.CROWDED:
      colorClass = 'bg-red-100 text-red-700';
      break;
    case EquipmentStatus.MAINTENANCE:
      colorClass = 'bg-slate-200 text-slate-500';
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
};

const EquipmentStatusList: React.FC<EquipmentStatusListProps> = ({ equipment }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'treadmills': return <Activity size={20} />;
      case 'benches': return <Dumbbell size={20} />;
      case 'squat_racks': return <Boxes size={20} />;
      default: return <Dumbbell size={20} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Equipment Availability</h3>
        <p className="text-slate-500 text-sm">Real-time status by category</p>
      </div>
      <div className="divide-y divide-slate-100">
        {equipment.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                {getIcon(item.id)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700">{item.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-full bg-slate-200 rounded-full h-1.5 w-16">
                      <div 
                        className="bg-slate-400 h-1.5 rounded-full" 
                        style={{ width: `${(item.availableUnits / item.totalUnits) * 100}%`}}
                      />
                   </div>
                   <span className="text-xs text-slate-400">
                     {item.availableUnits}/{item.totalUnits} Free
                   </span>
                </div>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentStatusList;