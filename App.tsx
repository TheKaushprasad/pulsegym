import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bell, 
  MapPin, 
  LayoutDashboard, 
  UserCircle,
  Clock,
  Dumbbell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import OccupancyDisplay from './components/OccupancyDisplay';
import CrowdChart from './components/CrowdChart';
import EquipmentList from './components/EquipmentStatus'; 
import AdminPanel from './components/AdminPanel';
import CheckInModule from './components/CheckInModule';
import TimeSelector from './components/TimeSelector';
import { 
  MAX_CAPACITY, 
  INITIAL_EQUIPMENT, 
  generateForecastData, 
  RECOMMENDATIONS,
  WORKOUT_FOCUS_OPTIONS,
  simulateEquipmentAvailability
} from './constants';
import { EquipmentCategory, EquipmentStatus, NotificationSetting } from './types';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<'member' | 'admin'>('member');
  const [currentMembers, setCurrentMembers] = useState(124);
  const [equipment, setEquipment] = useState<EquipmentCategory[]>(INITIAL_EQUIPMENT);
  const [forecastData, setForecastData] = useState(generateForecastData());
  const [notification, setNotification] = useState<NotificationSetting>({ enabled: false, threshold: 50 });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('Now'); // 'Now' or e.g. '14:00'
  
  // Check-in State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionData, setSessionData] = useState<{ duration: number, startTime: Date } | null>(null);

  // --- Effects ---
  
  // Simulate live data changes (Member count drift)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only drift if we are effectively "live" in the backend, though displayed members might be predicted
      setCurrentMembers((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        const newValue = prev + change;
        return Math.min(Math.max(newValue, 0), MAX_CAPACITY);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate updating current forecast point to match live data
  useEffect(() => {
    setForecastData(prev => {
      const newData = [...prev];
      const currentIdx = newData.findIndex(d => d.time === 'Now');
      if (currentIdx !== -1) {
        newData[currentIdx] = {
          ...newData[currentIdx],
          occupancyPercentage: Math.round((currentMembers / MAX_CAPACITY) * 100)
        };
      }
      return newData;
    });
  }, [currentMembers]);

  // --- Derived State for Prediction Mode ---
  const isPredictedView = selectedTime !== 'Now';

  const displayedMembers = useMemo(() => {
    if (!isPredictedView) return currentMembers;

    const point = forecastData.find(d => d.time === selectedTime);
    if (!point) return currentMembers;

    return Math.round((point.occupancyPercentage / 100) * MAX_CAPACITY);
  }, [currentMembers, forecastData, selectedTime, isPredictedView]);

  const displayedEquipment = useMemo(() => {
    if (!isPredictedView) return equipment;

    // Simulate equipment based on predicted occupancy
    const occupancyPercent = (displayedMembers / MAX_CAPACITY) * 100;
    return simulateEquipmentAvailability(equipment, occupancyPercent);
  }, [equipment, displayedMembers, isPredictedView]);

  // --- Handlers ---

  const handleEquipmentUpdate = useCallback((id: string, status: EquipmentStatus) => {
    setEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  }, []);

  const toggleNotification = () => {
    setNotification(prev => ({ ...prev, enabled: !prev.enabled }));
    setShowNotifModal(false);
  };

  const handleCheckIn = (focusId: string, duration: number) => {
    setIsCheckedIn(true);
    setSessionData({ duration, startTime: new Date() });
    setSelectedFocus(focusId);
    setCurrentMembers(prev => Math.min(prev + 1, MAX_CAPACITY));
    setSelectedTime('Now'); // Force view to live when checking in
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setSessionData(null);
    setCurrentMembers(prev => Math.max(prev - 1, 0));
    setSelectedFocus('all');
  };

  // --- Derived State for Workout Focus ---

  const relevantEquipment = useMemo(() => {
    const focus = WORKOUT_FOCUS_OPTIONS.find(o => o.id === selectedFocus);
    if (!focus || focus.equipmentIds.length === 0) return displayedEquipment;
    return displayedEquipment.filter(eq => focus.equipmentIds.includes(eq.id));
  }, [displayedEquipment, selectedFocus]);

  const focusInsight = useMemo(() => {
    if (selectedFocus === 'all') return null;
    
    // Calculate availability score for relevant equipment
    const totalUnits = relevantEquipment.reduce((acc, curr) => acc + curr.totalUnits, 0);
    const availableUnits = relevantEquipment.reduce((acc, curr) => acc + curr.availableUnits, 0);
    const availabilityRate = totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0;
    
    // Check for critical bottlenecks (Crowded items)
    const bottlenecks = relevantEquipment.filter(eq => eq.status === EquipmentStatus.CROWDED);
    
    if (availabilityRate < 20 || bottlenecks.length > 0) {
      return {
        type: 'warning',
        message: bottlenecks.length > 0 
          ? `${bottlenecks[0].name} are ${isPredictedView ? 'predicted to be' : 'currently'} crowded.` 
          : 'High usage on required machines.',
        subtext: 'Consider an alternative workout or prepare to wait.'
      };
    }
    
    return {
      type: 'good',
      message: `Good availability ${isPredictedView ? 'predicted' : ''} for this workout.`,
      subtext: `${Math.round(availabilityRate)}% of relevant equipment is ${isPredictedView ? 'expected to be' : ''} free.`
    };
  }, [relevantEquipment, selectedFocus, isPredictedView]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              Pulse<span className="font-light text-slate-800">Gym</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setView(view === 'member' ? 'admin' : 'member');
                if (view === 'member') setSelectedTime('Now'); // Reset to live when entering admin
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                view === 'admin' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {view === 'member' ? 'Switch to Admin' : 'Switch to Member'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifModal(!showNotifModal)}
                className={`p-2 rounded-full transition-colors ${notification.enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
              >
                <Bell size={20} className={notification.enabled ? 'fill-current' : ''} />
                {notification.enabled && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Simple Notification Dropdown */}
              {showNotifModal && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-bold mb-2">Crowd Alerts</h3>
                  <p className="text-xs text-slate-500 mb-4">Get notified when gym capacity drops below your threshold.</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Alert me when &lt; {notification.threshold}%</span>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      value={notification.threshold}
                      onChange={(e) => setNotification({...notification, threshold: parseInt(e.target.value)})} 
                      className="w-20"
                    />
                  </div>

                  <button 
                    onClick={toggleNotification}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                      notification.enabled 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {notification.enabled ? 'Disable Alerts' : 'Enable Notification'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {view === 'member' ? (
          <>
            {/* Header / Greeting */}
            <header className="mb-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <MapPin size={14} />
                <span>Downtown Branch • Open until 11 PM</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Hello, Kaushal 👋
              </h1>
            </header>

            {/* Check In Module */}
            <CheckInModule 
              isCheckedIn={isCheckedIn}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              currentFocusId={selectedFocus}
            />
            
            {/* Time Selector */}
            {!isCheckedIn && (
              <TimeSelector 
                forecastData={forecastData}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            )}

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hero Occupancy Widget */}
              <OccupancyDisplay 
                currentMembers={displayedMembers} 
                maxCapacity={MAX_CAPACITY} 
                isPredicted={isPredictedView}
              />
              
              {/* Recommendations & Quick Stats */}
              <div className="space-y-6 flex flex-col">
                 {/* Best Times Card */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                       <Clock className="text-indigo-500" size={20} />
                       <h3 className="font-bold text-slate-800">Best Times to Visit</h3>
                    </div>
                    <div className="space-y-3">
                      {RECOMMENDATIONS.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                           <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                           <div>
                             <p className="font-bold text-indigo-900 text-sm">{rec.time}</p>
                             <p className="text-indigo-700/80 text-xs">{rec.reason}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Workout Focus Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Dumbbell size={20} className="text-blue-600" />
                <h3 className="font-bold text-lg">Machine Availability</h3>
              </div>
              {!isCheckedIn && (
                 <p className="text-slate-500 text-sm">Select your focus to filter equipment below.</p>
              )}
              
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {WORKOUT_FOCUS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFocus(option.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedFocus === option.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Insight for Selected Workout */}
              {focusInsight && (
                <div className={`rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${
                  focusInsight.type === 'good' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-orange-50 border-orange-100 text-orange-800'
                }`}>
                  {focusInsight.type === 'good' ? (
                    <CheckCircle2 className="flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                  )}
                  <div>
                    <p className="font-bold text-sm">{focusInsight.message}</p>
                    <p className="text-xs opacity-90 mt-0.5">{focusInsight.subtext}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Equipment Status (Filtered & Potentially Predicted) */}
            <EquipmentList equipment={relevantEquipment} />

            {/* Charts Section */}
            <CrowdChart data={forecastData} />

          </>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
             <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Admin Mode Active:</strong> Changes made here reflect immediately on the Member View.
                </p>
             </div>
             <AdminPanel 
               currentMembers={currentMembers}
               maxCapacity={MAX_CAPACITY}
               equipment={equipment}
               onUpdateOccupancy={setCurrentMembers}
               onUpdateEquipment={handleEquipmentUpdate}
             />
          </div>
        )}

      </main>

      {/* Mobile Tab Bar (Visual only for mobile-first feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-40 pb-safe">
        <button className={`flex flex-col items-center gap-1 ${view === 'member' ? 'text-blue-600' : 'text-slate-400'}`} onClick={() => setView('member')}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Overview</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
           <Clock size={20} />
           <span className="text-[10px] font-medium">Schedule</span>
        </button>
        <div className="w-12 h-12 bg-blue-600 rounded-full -mt-6 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
           <MapPin size={20} />
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400">
           <Bell size={20} />
           <span className="text-[10px] font-medium">Alerts</span>
        </button>
        <button className={`flex flex-col items-center gap-1 ${view === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} onClick={() => setView('admin')}>
          <UserCircle size={20} />
          <span className="text-[10px] font-medium">Admin</span>
        </button>
      </div>

    </div>
  );
};

export default App;