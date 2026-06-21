export type RouteStatus = 'normal' | 'delayed' | 'abnormal';
export type AbnormalType = 'absent' | 'wrong_station' | 'parent_pickup';
export type ShiftType = 'morning' | 'afternoon';
export type FollowUpStatus = 'pending' | 'contacted' | 'waiting' | 'confirmed';
export type StudentStatus = 'boarded' | 'unconfirmed' | 'abnormal';

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
  caretakerPhone: string;
  driverPhone: string;
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
  followUpStatus: FollowUpStatus;
  followUpNote: string;
  followUpTime: string;
  status: StudentStatus;
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
  alightingCheckTime?: string;
  cabinCheckTime?: string;
}

export interface DashboardStats {
  totalRoutes: number;
  runningRoutes: number;
  completedRoutes: number;
  abnormalCount: number;
  currentTime: string;
  dutyOfficer: string;
  urgentCount: number;
}

export interface AlertItem {
  id: string;
  type: 'route' | 'student';
  priority: 1 | 2;
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  contactName: string;
  contactPhone: string;
  routeId?: string;
  studentId?: string;
  reportTime: string;
}

export interface StudentDetail {
  id: string;
  name: string;
  className: string;
  station: string;
  status: StudentStatus;
  boardedTime?: string;
  abnormalType?: AbnormalType;
  abnormalNote?: string;
  contactPerson?: string;
  contactPhone?: string;
}

export const followUpStatusLabels: Record<FollowUpStatus, string> = {
  pending: '待处理',
  contacted: '已联系家长',
  waiting: '等待回复',
  confirmed: '已确认安全',
};

export const followUpStatusColors: Record<FollowUpStatus, string> = {
  pending: 'bg-red-500/20 text-red-400 border-red-500/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  boarded: '已上车',
  unconfirmed: '未确认',
  abnormal: '异常',
};

export const studentStatusColors: Record<StudentStatus, string> = {
  boarded: 'bg-green-500/20 text-green-400 border-green-500/30',
  unconfirmed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  abnormal: 'bg-red-500/20 text-red-400 border-red-500/30',
};
