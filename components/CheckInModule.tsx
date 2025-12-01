import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  LogOut, 
  Timer, 
  Dumbbell, 
  X, 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  Edit2,
  Trash2,
  Moon
} from 'lucide-react';
import { DURATION_OPTIONS, WORKOUT_FOCUS_OPTIONS } from '../constants';

interface CheckInModuleProps {
  isCheckedIn: boolean;
  onCheckIn: (focusId: string, duration: number) => void;
  onCheckOut: () => void;
  currentFocusId: string;
}

interface ScheduledSession {
  id: string;
  dateKey: string; // e.g. "Mon Oct 27 2025"
  focusId: string;
  duration: number;
  timeLabel: string; // e.g., "14:00"
  isRestDay?: boolean;
}

const CheckInModule: React.FC<CheckInModuleProps> = ({ 
  isCheckedIn, 
  onCheckIn, 
  onCheckOut,
  currentFocusId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Weekly Schedule State
  const [schedule, setSchedule] = useState<Record<string, ScheduledSession>>({});
  
  // Modal Form State
  const [editingDate, setEditingDate] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedFocus, setSelectedFocus] = useState(currentFocusId === 'all' ? WORKOUT_FOCUS_OPTIONS[1].id : currentFocusId);
  const [startTime, setStartTime] = useState('Now');

  // --- Helpers ---

  // Generate next 7 days
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const getDayNumber = (date: Date) => date.getDate();
  const getDateKey = (date: Date) => date.toDateString();

  // Helper variable to fix type inference issues
  const currentSession = schedule[getDateKey(editingDate)];

  const generateTimeSlots = () => {
    const slots = isToday(editingDate) ? ['Now'] : [];
    const startHour = 6; // 6 AM
    
    for (let i = 0; i < 16; i++) {
      const h = startHour + i;
      slots.push(`${h}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // --- Handlers ---

  const handleDayClick = (date: Date) => {
    setEditingDate(date);
    const key = getDateKey(date);
    const existingSession = schedule[key];

    if (existingSession && !existingSession.isRestDay) {
      // Pre-fill if editing
      setSelectedFocus(existingSession.focusId);
      setSelectedDuration(existingSession.duration);
      setStartTime(existingSession.timeLabel);
    } else {
      // Reset defaults
      setSelectedFocus(WORKOUT_FOCUS_OPTIONS[1].id);
      setSelectedDuration(60);
      setStartTime(isToday(date) ? 'Now' : '9:00');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (startTime === 'Now' && isToday(editingDate)) {
      onCheckIn(selectedFocus, selectedDuration);
      setIsModalOpen(false);
      return;
    }

    const key = getDateKey(editingDate);
    const newSession: ScheduledSession = {
      id: Date.now().toString(),
      dateKey: key,
      focusId: selectedFocus,
      duration: selectedDuration,
      timeLabel: startTime,
      isRestDay: false
    };

    setSchedule(prev => ({ ...prev, [key]: newSession }));
    
    setIsModalOpen(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSkipDay = () => {
    const key = getDateKey(editingDate);
    
    // If it was already a rest day or empty, we explicitly mark it as rest
    const restSession: ScheduledSession = {
      id: Date.now().toString(),
      dateKey: key,
      focusId: '',
      duration: 0,
      timeLabel: '',
      isRestDay: true
    };

    setSchedule(prev => ({ ...prev, [key]: restSession }));
    setIsModalOpen(false);
  };

  const handleDelete = () => {
     const key = getDateKey(editingDate);
     const newSchedule = { ...schedule };
     delete newSchedule[key];
     setSchedule(newSchedule);
     setIsModalOpen(false);
  };

  const getFocusLabel = (id: string) => {
    const focus = WORKOUT_FOCUS_OPTIONS.find(f => f.id === id);
    return focus ? focus.label : 'Workout';
  };

  // --- Render ---

  // 1. Live Session View
  if (isCheckedIn) {
    return (
       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Live Session</span>
            </div>
            <h3 className="font-bold text-xl">Training in Progress</h3>
            <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
               <Dumbbell size={14} /> 
               {getFocusLabel(currentFocusId)}
               <span className="opacity-50">•</span>
               <Timer size={14} /> 
               Duration: {selectedDuration / 60}h
            </p>
          </div>
          <button 
            onClick={onCheckOut}
            className="bg-white/10 hover:bg-white/20 border border-white/20 transition-colors p-3 rounded-xl flex flex-col items-center gap-1 min-w-[80px]"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-bold uppercase">Check Out</span>
          </button>
       </div>
    );
  }

  // 2. Weekly Schedule View
  return (
    <div className="mb-6 space-y-4">
      {/* Success Feedback */}
      {showSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in shadow-sm">
          <div className="bg-emerald-500 rounded-full p-1 text-white mt-0.5">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="font-bold text-sm">Schedule Updated!</p>
            <p className="text-xs opacity-80 mt-0.5">Your plan for the week has been saved.</p>
          </div>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="ml-auto text-emerald-600 hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                Your Week
              </h3>
              <p className="text-slate-500 text-xs mt-1">Tap any day to plan, edit, or skip.</p>
            </div>
            
            {/* Quick Action for Today */}
            <button 
              onClick={() => handleDayClick(new Date())}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              Plan Today
            </button>
         </div>

         {/* Calendar Strip */}
         <div className="flex justify-between items-stretch gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weekDays.map((date, index) => {
              const key = getDateKey(date);
              const session = schedule[key];
              const isTodayDate = isToday(date);
              const hasSession = session && !session.isRestDay;
              const isRest = session?.isRestDay;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`
                    flex flex-col items-center justify-between p-2 rounded-xl min-w-[48px] md:flex-1 border-2 transition-all h-20
                    ${isTodayDate ? 'border-blue-200 bg-blue-50/50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}
                  `}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {getDayName(date)}
                  </span>
                  <span className={`text-lg font-bold ${isTodayDate ? 'text-blue-600' : 'text-slate-700'}`}>
                    {getDayNumber(date)}
                  </span>
                  
                  {/* Status Indicator */}
                  <div className="h-4 flex items-center justify-center">
                    {hasSession && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />
                    )}
                    {isRest && (
                      <Moon size={12} className="text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })}
         </div>

         {/* Contextual Summary of Selected Day in Week View (Optional, showing next up) */}
         {Object.values(schedule).filter((s: ScheduledSession) => !s.isRestDay).length > 0 && (
           <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase">
               <ChevronRight size={12} />
               Upcoming Schedule
             </div>
             <div className="space-y-2">
               {weekDays.slice(0, 3).map(day => {
                 const s = schedule[getDateKey(day)];
                 if (!s || s.isRestDay) return null;
                 return (
                   <div key={s.id} className="flex items-center justify-between text-sm group cursor-pointer" onClick={() => handleDayClick(day)}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 w-8">{getDayName(day)}</span>
                        <span className="font-semibold text-slate-700">{s.timeLabel}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-900">{getFocusLabel(s.focusId)}</span>
                      </div>
                      <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-slate-400" />
                   </div>
                 );
               })}
             </div>
           </div>
         )}
      </div>

      {/* Check In / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {isToday(editingDate) ? 'Plan Today' : `Schedule ${getDayName(editingDate)}`}
                  <span className="text-slate-400 font-normal text-sm">
                    {editingDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {currentSession ? 'Edit your existing plan' : 'Add a workout or take a rest'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Skip / Rest Day Option */}
              {!currentSession?.isRestDay && (
                <div className="flex gap-2">
                   <button 
                     onClick={handleSkipDay}
                     className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
                   >
                     <Moon size={16} />
                     Mark as Rest Day
                   </button>
                   {currentSession && (
                     <button 
                       onClick={handleDelete}
                       className="py-2 px-4 rounded-xl border border-red-100 text-red-600 bg-red-50 text-sm font-semibold hover:bg-red-100"
                     >
                       <Trash2 size={16} />
                     </button>
                   )}
                </div>
              )}

              {/* If Rest Day, show simple view */}
              {currentSession?.isRestDay ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Moon size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-600 font-medium">This is set as a Rest Day</p>
                  <button 
                    onClick={handleDelete} 
                    className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                  >
                    Change to Workout
                  </button>
                </div>
              ) : (
                <>
                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Clock size={16} /> Start Time
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setStartTime(time)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                            startTime === time
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Section */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Dumbbell size={16} /> Focus Area
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {WORKOUT_FOCUS_OPTIONS.filter(o => o.id !== 'all').map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedFocus(opt.id)}
                          className={`p-3 rounded-xl text-left border transition-all ${
                            selectedFocus === opt.id 
                              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span className="font-semibold block text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Section */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Timer size={16} /> Duration
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {DURATION_OPTIONS.map(dur => (
                        <button
                          key={dur.value}
                          onClick={() => setSelectedDuration(dur.value)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                            selectedDuration === dur.value
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Action */}
                  <button 
                    onClick={handleSave}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-lg mt-2 ${
                      startTime === 'Now' && isToday(editingDate)
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                    }`}
                  >
                    {startTime === 'Now' && isToday(editingDate) ? 'Check In Now' : 'Save Schedule'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInModule;