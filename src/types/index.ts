export type RouteStatus = 'normal' | 'delayed' | 'abnormal';
export type AbnormalType = 'absent' | 'wrong_station' | 'parent_pickup';
export type ShiftType = 'morning' | 'afternoon';
export type FollowUpStatus = 'pending' | 'contacted' | 'waiting' | 'confirmed';
export type StudentStatus = 'boarded' | 'unconfirmed' | 'abnormal';
export type AlertType = 'route' | 'student' | 'cabin_check';
export type ActionType = 'contact_parent' | 'waiting_reply' | 'confirm_safety' | 'urge_cabin_check' | 'route_delay' | 'route_abnormal' | 'cabin_complete' | 'boarding_complete';

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

export interface FollowUpRecord {
  id: string;
  status: FollowUpStatus;
  operator: string;
  operatorRole: 'duty_officer' | 'caretaker' | 'teacher';
  note: string;
  time: string;
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
  followUpRecords: FollowUpRecord[];
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
  type: AlertType;
  priority: 1 | 2;
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  contactName: string;
  contactPhone: string;
  routeId?: string;
  studentId?: string;
  shiftId?: string;
  reportTime: string;
  actionLabel?: string;
  targetRoute?: string;
  targetStudent?: string;
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

export const operatorRoleLabels: Record<string, string> = {
  duty_officer: '值班老师',
  caretaker: '照管员',
  teacher: '班主任',
};

export const operatorRoleColors: Record<string, string> = {
  duty_officer: 'bg-blue-500/20 text-blue-400',
  caretaker: 'bg-purple-500/20 text-purple-400',
  teacher: 'bg-green-500/20 text-green-400',
};

export interface DisposalAction {
  id: string;
  routeId: string;
  routeName: string;
  type: ActionType;
  title: string;
  description: string;
  operator: string;
  operatorRole: 'duty_officer' | 'caretaker' | 'teacher';
  time: string;
  studentId?: string;
  studentName?: string;
  shiftId?: string;
  priority: 1 | 2;
}

export const actionTypeLabels: Record<ActionType, string> = {
  contact_parent: '联系家长',
  waiting_reply: '等待回复',
  confirm_safety: '确认安全',
  urge_cabin_check: '催促清查',
  route_delay: '线路延迟',
  route_abnormal: '线路异常',
  cabin_complete: '清查完成',
  boarding_complete: '点名完成',
};

export const actionTypeColors: Record<ActionType, string> = {
  contact_parent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_reply: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  confirm_safety: 'bg-green-500/20 text-green-400 border-green-500/30',
  urge_cabin_check: 'bg-red-500/20 text-red-400 border-red-500/30',
  route_delay: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  route_abnormal: 'bg-red-500/20 text-red-400 border-red-500/30',
  cabin_complete: 'bg-green-500/20 text-green-400 border-green-500/30',
  boarding_complete: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const actionTypeIcons: Record<ActionType, string> = {
  contact_parent: 'phone',
  waiting_reply: 'clock',
  confirm_safety: 'check',
  urge_cabin_check: 'alert',
  route_delay: 'clock',
  route_abnormal: 'alert',
  cabin_complete: 'check',
  boarding_complete: 'check',
};
