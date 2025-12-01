export enum CrowdLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CROWDED = 'Crowded'
}

export enum EquipmentStatus {
  LOW_USAGE = 'Low Usage',
  MODERATE_USAGE = 'Moderate Usage',
  HIGH_USAGE = 'High Usage',
  CROWDED = 'Crowded', // e.g. all taken + wait list
  MAINTENANCE = 'Maintenance'
}

export interface EquipmentCategory {
  id: string;
  name: string;
  totalUnits: number;
  availableUnits: number;
  status: EquipmentStatus;
}

export interface CrowdDataPoint {
  time: string;
  occupancyPercentage: number;
  isPredicted: boolean;
}

export interface GymState {
  currentMembers: number;
  maxCapacity: number;
  lastUpdated: Date;
}

export interface NotificationSetting {
  enabled: boolean;
  threshold: number;
}

export interface WorkoutFocus {
  id: string;
  label: string;
  equipmentIds: string[]; // IDs of relevant equipment
}