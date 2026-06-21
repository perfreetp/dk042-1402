export type RouteStatus = 'normal' | 'delayed' | 'abnormal';
export type AbnormalType = 'absent' | 'wrong_station' | 'parent_pickup';
export type ShiftType = 'morning' | 'afternoon';

export interface Route {
  id: string;
  name: string;
  routeNumber: string;
  driver: string;
  caretaker: string;
  expectedCount: number;
  boardedCount: number;
  unconfirmedCount: number;
  status: RouteStatus;
  lastUpdate: string;
  currentLocation: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  station: string;
  routeId: string;
  abnormalType: AbnormalType;
  caretakerNote: string;
  contactPerson: string;
  contactPhone: string;
  priority: 1 | 2;
  reportTime: string;
  isNew?: boolean;
}

export interface Shift {
  id: string;
  date: string;
  shiftType: ShiftType;
  routeId: string;
  routeName: string;
  driver: string;
  caretaker: string;
  alightingCheck: boolean;
  cabinCheck: boolean;
  studentCount: number;
  abnormalCount: number;
  completedTime: string;
}

export interface DashboardStats {
  totalRoutes: number;
  runningRoutes: number;
  completedRoutes: number;
  abnormalCount: number;
  currentTime: string;
  dutyOfficer: string;
}
