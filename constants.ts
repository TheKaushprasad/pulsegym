import { CrowdDataPoint, EquipmentCategory, EquipmentStatus, WorkoutFocus } from './types';

export const MAX_CAPACITY = 200;

export const INITIAL_EQUIPMENT: EquipmentCategory[] = [
  {
    id: 'treadmills',
    name: 'Treadmills',
    totalUnits: 20,
    availableUnits: 15,
    status: EquipmentStatus.LOW_USAGE,
  },
  {
    id: 'benches',
    name: 'Benches',
    totalUnits: 10,
    availableUnits: 2,
    status: EquipmentStatus.HIGH_USAGE,
  },
  {
    id: 'squat_racks',
    name: 'Squat Racks',
    totalUnits: 6,
    availableUnits: 0,
    status: EquipmentStatus.CROWDED,
  },
  {
    id: 'free_weights',
    name: 'Free Weights',
    totalUnits: 50,
    availableUnits: 30,
    status: EquipmentStatus.MODERATE_USAGE,
  },
  {
    id: 'cable_machines',
    name: 'Cable Machines',
    totalUnits: 8,
    availableUnits: 4,
    status: EquipmentStatus.MODERATE_USAGE,
  }
];

export const WORKOUT_FOCUS_OPTIONS: WorkoutFocus[] = [
  { 
    id: 'all', 
    label: 'Overview', 
    equipmentIds: [] // Empty implies all
  },
  { 
    id: 'cardio', 
    label: 'Cardio', 
    equipmentIds: ['treadmills', 'cable_machines'] 
  },
  { 
    id: 'legs', 
    label: 'Leg Day', 
    equipmentIds: ['squat_racks', 'free_weights', 'cable_machines'] 
  },
  { 
    id: 'push', 
    label: 'Push (Chest/Tri)', 
    equipmentIds: ['benches', 'free_weights', 'cable_machines'] 
  },
  { 
    id: 'pull', 
    label: 'Pull (Back/Bi)', 
    equipmentIds: ['free_weights', 'cable_machines', 'treadmills'] 
  }
];

export const DURATION_OPTIONS = [
  { label: '1 Hour', value: 60 },
  { label: '1.5 Hours', value: 90 },
  { label: '2 Hours', value: 120 },
  { label: '2.5 Hours', value: 150 },
  { label: '3 Hours', value: 180 },
];

// Generate mock forecast data
export const generateForecastData = (): CrowdDataPoint[] => {
  const now = new Date();
  const data: CrowdDataPoint[] = [];
  
  // Last 2 hours (Historical)
  for (let i = -2; i < 0; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    data.push({
      time: time.getHours() + ':00',
      occupancyPercentage: 45 + Math.random() * 20,
      isPredicted: false
    });
  }

  // Current
  data.push({
    time: 'Now',
    occupancyPercentage: 65, // This will be overwritten by live state
    isPredicted: false
  });

  // Next 10 hours (Predicted) for better planning range
  for (let i = 1; i <= 10; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simple hourly curve logic
    let predictedVal = 40;
    if (hour >= 6 && hour < 9) predictedVal = 70; // Morning rush
    else if (hour >= 9 && hour < 12) predictedVal = 50;
    else if (hour >= 12 && hour < 14) predictedVal = 65; // Lunch rush
    else if (hour >= 17 && hour <= 20) predictedVal = 90; // Evening peak
    else if (hour > 20) predictedVal = 45; // Late night
    
    // Add some noise
    predictedVal = Math.min(100, Math.max(0, predictedVal + (Math.random() * 10 - 5)));

    data.push({
      time: hour + ':00',
      occupancyPercentage: predictedVal,
      isPredicted: true
    });
  }
  return data;
};

export const RECOMMENDATIONS = [
  { time: '14:00 - 15:30', reason: 'Lowest predicted crowd before evening rush' },
  { time: '20:30 - 22:00', reason: 'Late evening quiet period' }
];

// Helper to simulate equipment status based on predicted crowd level
export const simulateEquipmentAvailability = (
  baseEquipment: EquipmentCategory[], 
  occupancyPercent: number
): EquipmentCategory[] => {
  const loadFactor = occupancyPercent / 100;

  return baseEquipment.map(item => {
    // Different equipment has different "popularity" factors
    let popularity = 1.0;
    if (item.id === 'squat_racks' || item.id === 'benches') popularity = 1.3; // Always busier
    if (item.id === 'treadmills') popularity = 0.9;

    // Calculate simulated usage
    const busyUnits = Math.min(item.totalUnits, Math.round(item.totalUnits * loadFactor * popularity));
    const availableUnits = Math.max(0, item.totalUnits - busyUnits);
    
    // Determine status text
    const usagePercent = (busyUnits / item.totalUnits) * 100;
    let status = EquipmentStatus.LOW_USAGE;
    
    if (item.status === EquipmentStatus.MAINTENANCE) {
      status = EquipmentStatus.MAINTENANCE; // Preserve maintenance
    } else {
      if (usagePercent >= 90) status = EquipmentStatus.CROWDED;
      else if (usagePercent >= 70) status = EquipmentStatus.HIGH_USAGE;
      else if (usagePercent >= 40) status = EquipmentStatus.MODERATE_USAGE;
    }

    return {
      ...item,
      availableUnits,
      status
    };
  });
};