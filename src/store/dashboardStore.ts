import { create } from 'zustand';
import type { Route, Student, Shift, AlertItem, StudentDetail, FollowUpStatus } from '../types';
import {
  initialRoutes,
  initialStudents,
  initialShifts,
  routeStudentDetails,
  dutyOfficer,
  statusLabels,
  abnormalTypeLabels,
  getTodayDateString,
} from '../data/mockData';

interface DashboardState {
  routes: Route[];
  students: Student[];
  shifts: Shift[];
  routeStudentDetails: Record<string, StudentDetail[]>;
  currentOperator: string;
  currentOperatorRole: 'duty_officer' | 'caretaker' | 'teacher';

  setRoutes: (routes: Route[]) => void;
  setStudents: (students: Student[]) => void;
  setShifts: (shifts: Shift[]) => void;

  updateRouteStatus: (routeId: string, updates: Partial<Route>) => void;

  updateStudentFollowUp: (
    studentId: string,
    status: FollowUpStatus,
    note: string
  ) => void;

  getRouteById: (routeId: string) => Route | undefined;
  getStudentsByRoute: (routeId: string) => Student[];
  getTodayMorningShifts: () => Shift[];
  getAlerts: () => AlertItem[];
  getStudentDetailsByRoute: (routeId: string) => StudentDetail[];

  simulateDataUpdate: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  routes: initialRoutes,
  students: initialStudents,
  shifts: initialShifts,
  routeStudentDetails: routeStudentDetails,
  currentOperator: dutyOfficer,
  currentOperatorRole: 'duty_officer',

  setRoutes: (routes) => set({ routes }),
  setStudents: (students) => set({ students }),
  setShifts: (shifts) => set({ shifts }),

  updateRouteStatus: (routeId, updates) =>
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === routeId ? { ...r, ...updates } : r
      ),
    })),

  updateStudentFollowUp: (studentId, status, note) =>
    set((state) => {
      const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      const { currentOperator, currentOperatorRole } = state;

      return {
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                followUpStatus: status,
                followUpNote: note,
                followUpTime: now,
                isNew: false,
                followUpRecords: [
                  ...s.followUpRecords,
                  {
                    id: `rec-${Date.now()}`,
                    status,
                    operator: currentOperator,
                    operatorRole: currentOperatorRole,
                    note,
                    time: now,
                  },
                ],
              }
            : s
        ),
      };
    }),

  getRouteById: (routeId) => {
    const { routes } = get();
    return routes.find((r) => r.id === routeId);
  },

  getStudentsByRoute: (routeId) => {
    const { students } = get();
    return students.filter((s) => s.routeId === routeId);
  },

  getTodayMorningShifts: () => {
    const { shifts, routes } = get();
    const today = getTodayDateString();

    const existingShifts = shifts.filter(
      (s) => s.date === today && s.shiftType === 'morning'
    );
    const existingRouteIds = new Set(existingShifts.map((s) => s.routeId));

    const missingShifts: Shift[] = routes
      .filter((r) => !existingRouteIds.has(r.id))
      .map((r, index) => ({
        id: `temp-shift-${r.id}`,
        date: today,
        shiftType: 'morning' as const,
        routeId: r.id,
        routeName: r.name,
        driver: r.driver,
        caretaker: r.caretaker,
        alightingCheck: false,
        cabinCheck: false,
        studentCount: r.expectedCount,
        abnormalCount: 0,
        completedTime: '',
      }));

    const allShifts = [...existingShifts, ...missingShifts];

    return allShifts.sort((a, b) => {
      const aIncomplete = !a.alightingCheck || !a.cabinCheck ? 1 : 0;
      const bIncomplete = !b.alightingCheck || !b.cabinCheck ? 1 : 0;
      if (aIncomplete !== bIncomplete) return aIncomplete - bIncomplete;
      return a.routeName.localeCompare(b.routeName);
    });
  },

  getAlerts: () => {
    const { routes, students, shifts } = get();
    const today = getTodayDateString();
    const result: AlertItem[] = [];

    routes.forEach((route) => {
      if (route.status === 'abnormal') {
        result.push({
          id: `route-${route.id}`,
          type: 'route',
          priority: 1,
          title: route.name,
          subtitle: `${route.driver} / ${route.caretaker}`,
          status: statusLabels[route.status],
          statusColor: 'text-red-400',
          contactName: route.caretaker,
          contactPhone: route.caretakerPhone,
          routeId: route.id,
          reportTime: route.lastUpdate,
          actionLabel: '查看线路',
          targetRoute: route.id,
        });
      } else if (route.status === 'delayed') {
        result.push({
          id: `route-${route.id}`,
          type: 'route',
          priority: 2,
          title: route.name,
          subtitle: `${route.driver} / ${route.caretaker}`,
          status: statusLabels[route.status],
          statusColor: 'text-orange-400',
          contactName: route.caretaker,
          contactPhone: route.caretakerPhone,
          routeId: route.id,
          reportTime: route.lastUpdate,
          actionLabel: '查看线路',
          targetRoute: route.id,
        });
      }
    });

    students.forEach((student) => {
      if (student.followUpStatus !== 'confirmed') {
        const route = routes.find((r) => r.id === student.routeId);
        result.push({
          id: `student-${student.id}`,
          type: 'student',
          priority: student.priority,
          title: student.name,
          subtitle: `${student.className} · ${student.station}`,
          status: abnormalTypeLabels[student.abnormalType],
          statusColor: student.priority === 1 ? 'text-red-400' : 'text-orange-400',
          contactName: student.contactPerson,
          contactPhone: student.contactPhone,
          routeId: student.routeId,
          studentId: student.id,
          reportTime: student.reportTime,
          actionLabel: '查看学生',
          targetRoute: student.routeId,
          targetStudent: student.id,
        });
      }
    });

    const todayShifts = shifts.filter(
      (s) => s.date === today && s.shiftType === 'morning'
    );
    todayShifts.forEach((shift) => {
      if (shift.completedTime && !shift.cabinCheck) {
        const route = routes.find((r) => r.id === shift.routeId);
        result.push({
          id: `cabin-${shift.id}`,
          type: 'cabin_check',
          priority: 1,
          title: `${shift.routeName} - 车厢待清查`,
          subtitle: `司机: ${shift.driver} / 照管: ${shift.caretaker}`,
          status: '待清查',
          statusColor: 'text-red-400',
          contactName: shift.caretaker,
          contactPhone: route?.caretakerPhone || '',
          routeId: shift.routeId,
          shiftId: shift.id,
          reportTime: shift.completedTime,
          actionLabel: '催促清查',
          targetRoute: shift.routeId,
        });
      }
    });

    return result.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.reportTime.localeCompare(a.reportTime);
    });
  },

  getStudentDetailsByRoute: (routeId) => {
    const { routeStudentDetails, routes, students } = get();
    const route = routes.find((r) => r.id === routeId);

    if (routeStudentDetails[routeId]) {
      return routeStudentDetails[routeId];
    }

    if (!route) return [];

    const abnormalStudents = students.filter((s) => s.routeId === routeId);
    const placeholderDetails: StudentDetail[] = [];

    for (let i = 0; i < route.boardedCount; i++) {
      placeholderDetails.push({
        id: `${routeId}-b-${i}`,
        name: `学生${i + 1}`,
        className: '待同步',
        station: '待同步',
        status: 'boarded',
        boardedTime: '待同步',
      });
    }

    for (let i = 0; i < route.unconfirmedCount; i++) {
      placeholderDetails.push({
        id: `${routeId}-u-${i}`,
        name: `未确认${i + 1}`,
        className: '待同步',
        station: '待同步',
        status: 'unconfirmed',
      });
    }

    abnormalStudents.forEach((s) => {
      placeholderDetails.push({
        id: s.id,
        name: s.name,
        className: s.className,
        station: s.station,
        status: 'abnormal',
        abnormalType: s.abnormalType,
        abnormalNote: s.caretakerNote,
        contactPerson: s.contactPerson,
        contactPhone: s.contactPhone,
      });
    });

    return placeholderDetails;
  },

  simulateDataUpdate: () =>
    set((state) => {
      const formatTime = (date: Date) =>
        date.toLocaleTimeString('zh-CN', { hour12: false });

      const updatedRoutes = state.routes.map((route) => {
        if (route.unconfirmedCount > 0 && Math.random() > 0.6) {
          const newBoarded = route.boardedCount + 1;
          const newUnconfirmed = route.unconfirmedCount - 1;
          let newStatus = route.status;

          if (newUnconfirmed === 0 && route.status !== 'abnormal') {
            newStatus = 'normal';
          }

          return {
            ...route,
            boardedCount: newBoarded,
            unconfirmedCount: newUnconfirmed,
            status: newStatus,
            lastUpdate: formatTime(new Date()),
          };
        }

        if (Math.random() > 0.9 && route.status !== 'abnormal') {
          return {
            ...route,
            status: 'delayed' as const,
            lastUpdate: formatTime(new Date()),
          };
        }

        return route;
      });

      return { routes: updatedRoutes };
    }),
}));
