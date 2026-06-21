import { create } from 'zustand';
import type {
  Route,
  Student,
  Shift,
  AlertItem,
  StudentDetail,
  FollowUpStatus,
  DisposalAction,
  ActionType,
} from '../types';
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
  disposalActions: DisposalAction[];
  currentOperator: string;
  currentOperatorRole: 'duty_officer' | 'caretaker' | 'teacher';
  highlightedStudentId: string | null;
  highlightedShiftId: string | null;

  setRoutes: (routes: Route[]) => void;
  setStudents: (students: Student[]) => void;
  setShifts: (shifts: Shift[]) => void;
  setHighlightedStudentId: (id: string | null) => void;
  setHighlightedShiftId: (id: string | null) => void;

  updateRouteStatus: (routeId: string, updates: Partial<Route>) => void;

  updateStudentFollowUp: (
    studentId: string,
    status: FollowUpStatus,
    note: string
  ) => void;

  addDisposalAction: (
    type: ActionType,
    routeId: string,
    title: string,
    description: string,
    options?: { studentId?: string; studentName?: string; priority?: 1 | 2 }
  ) => void;

  getRouteById: (routeId: string) => Route | undefined;
  getStudentsByRoute: (routeId: string) => Student[];
  getTodayMorningShifts: () => Shift[];
  getShiftByRouteId: (routeId: string) => Shift | undefined;
  getAlerts: () => AlertItem[];
  getStudentDetailsByRoute: (routeId: string) => StudentDetail[];
  getDisposalActionsByRoute: (routeId: string) => DisposalAction[];
  getAllDisposalActions: () => DisposalAction[];

  urgeCabinCheck: (routeId: string) => void;

  simulateDataUpdate: () => void;
}

function generateInitialDisposalActions(
  routes: Route[],
  students: Student[]
): DisposalAction[] {
  const actions: DisposalAction[] = [];
  const now = new Date();

  students.forEach((student) => {
    const route = routes.find((r) => r.id === student.routeId);
    if (!route) return;

    student.followUpRecords.forEach((record, idx) => {
      let actionType: ActionType;
      if (record.status === 'contacted') actionType = 'contact_parent';
      else if (record.status === 'waiting') actionType = 'waiting_reply';
      else if (record.status === 'confirmed') actionType = 'confirm_safety';
      else return;

      actions.push({
        id: `action-${student.id}-${idx}`,
        routeId: student.routeId,
        routeName: route.name,
        type: actionType,
        title: `${student.name} - ${record.status === 'confirmed' ? '已确认安全' : record.status === 'contacted' ? '已联系家长' : '等待回复'}`,
        description: record.note,
        operator: record.operator,
        operatorRole: record.operatorRole,
        time: record.time,
        studentId: student.id,
        studentName: student.name,
        priority: student.priority,
      });
    });
  });

  return actions.sort((a, b) => b.time.localeCompare(a.time));
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  routes: initialRoutes,
  students: initialStudents,
  shifts: initialShifts,
  routeStudentDetails: routeStudentDetails,
  disposalActions: generateInitialDisposalActions(initialRoutes, initialStudents),
  currentOperator: dutyOfficer,
  currentOperatorRole: 'duty_officer',
  highlightedStudentId: null,
  highlightedShiftId: null,

  setRoutes: (routes) => set({ routes }),
  setStudents: (students) => set({ students }),
  setShifts: (shifts) => set({ shifts }),
  setHighlightedStudentId: (id) => set({ highlightedStudentId: id }),
  setHighlightedShiftId: (id) => set({ highlightedShiftId: id }),

  updateRouteStatus: (routeId, updates) =>
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === routeId ? { ...r, ...updates } : r
      ),
    })),

  updateStudentFollowUp: (studentId, status, note) =>
    set((state) => {
      const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      const { currentOperator, currentOperatorRole, routes, disposalActions } = state;
      const student = state.students.find((s) => s.id === studentId);
      if (!student) return state;

      const route = routes.find((r) => r.id === student.routeId);

      let actionType: ActionType | null = null;
      if (status === 'contacted') actionType = 'contact_parent';
      else if (status === 'waiting') actionType = 'waiting_reply';
      else if (status === 'confirmed') actionType = 'confirm_safety';

      const newActions = [...disposalActions];
      if (actionType && route) {
        newActions.unshift({
          id: `action-${Date.now()}`,
          routeId: student.routeId,
          routeName: route.name,
          type: actionType,
          title: `${student.name} - ${status === 'confirmed' ? '已确认安全' : status === 'contacted' ? '已联系家长' : '等待回复'}`,
          description: note,
          operator: currentOperator,
          operatorRole: currentOperatorRole,
          time: now,
          studentId: student.id,
          studentName: student.name,
          priority: student.priority,
        });
      }

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
        disposalActions: newActions,
      };
    }),

  addDisposalAction: (type, routeId, title, description, options) =>
    set((state) => {
      const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      const route = state.routes.find((r) => r.id === routeId);
      if (!route) return state;

      return {
        disposalActions: [
          {
            id: `action-${Date.now()}`,
            routeId,
            routeName: route.name,
            type,
            title,
            description,
            operator: state.currentOperator,
            operatorRole: state.currentOperatorRole,
            time: now,
            studentId: options?.studentId,
            studentName: options?.studentName,
            priority: options?.priority || 2,
          },
          ...state.disposalActions,
        ],
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
    const { shifts, routes, students } = get();
    const today = getTodayDateString();

    const existingShifts = shifts.filter(
      (s) => s.date === today && s.shiftType === 'morning'
    );
    const existingRouteIds = new Set(existingShifts.map((s) => s.routeId));

    const missingShifts: Shift[] = routes
      .filter((r) => !existingRouteIds.has(r.id))
      .map((r) => {
        const routeAbnormalCount = students.filter(
          (s) => s.routeId === r.id && s.followUpStatus !== 'confirmed'
        ).length;
        return {
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
          abnormalCount: routeAbnormalCount,
          completedTime: '',
        };
      });

    const allShifts = [...existingShifts, ...missingShifts].map((shift) => {
      const routeAbnormalCount = students.filter(
        (s) => s.routeId === shift.routeId && s.followUpStatus !== 'confirmed'
      ).length;
      return {
        ...shift,
        abnormalCount: routeAbnormalCount > 0 ? routeAbnormalCount : shift.abnormalCount,
      };
    });

    return allShifts.sort((a, b) => {
      const aIsTemp = a.id.startsWith('temp-shift-') ? 0 : 1;
      const bIsTemp = b.id.startsWith('temp-shift-') ? 0 : 1;
      if (aIsTemp !== bIsTemp) return bIsTemp - aIsTemp;

      const aIncomplete = !a.alightingCheck || !a.cabinCheck ? 1 : 0;
      const bIncomplete = !b.alightingCheck || !b.cabinCheck ? 1 : 0;
      if (aIncomplete !== bIncomplete) return aIncomplete - bIncomplete;
      return a.routeName.localeCompare(b.routeName);
    });
  },

  getShiftByRouteId: (routeId: string) => {
    const { shifts } = get();
    const today = getTodayDateString();
    return shifts.find(
      (s) => s.routeId === routeId && s.date === today && s.shiftType === 'morning'
    );
  },

  urgeCabinCheck: (routeId: string) => {
    const { currentOperator, currentOperatorRole, addDisposalAction, shifts } = get();
    const today = getTodayDateString();
    const shift = shifts.find(
      (s) => s.routeId === routeId && s.date === today && s.shiftType === 'morning'
    );
    const route = get().routes.find((r) => r.id === routeId);

    if (!shift || !route) return;

    const missingItems = [];
    if (!shift.alightingCheck) missingItems.push('下车点名');
    if (!shift.cabinCheck) missingItems.push('车厢清查');
    const missingText = missingItems.join('、') || '检查';

    addDisposalAction(
      'urge_cabin_check',
      routeId,
      `${shift.routeName} - 催促${missingText}`,
      `值班老师${currentOperator}联系照管员${shift.caretaker}，催促完成${missingText}`,
      { priority: 1 }
    );
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
    if (!route) return [];

    const existingDetails = routeStudentDetails[routeId] || [];
    const abnormalStudents = students.filter((s) => s.routeId === routeId);

    const boardedFromDetails = existingDetails.filter((d) => d.status === 'boarded');
    const unconfirmedFromDetails = existingDetails.filter((d) => d.status === 'unconfirmed');
    const abnormalFromDetails = existingDetails.filter((d) => d.status === 'abnormal');

    const result: StudentDetail[] = [];
    const usedIds = new Set<string>();

    const abnormalList: StudentDetail[] = [];
    const abnormalDetailIds = new Set(abnormalFromDetails.map((d) => d.id));
    abnormalFromDetails.forEach((d) => {
      abnormalList.push(d);
      usedIds.add(d.id);
    });
    abnormalStudents.forEach((s) => {
      if (!abnormalDetailIds.has(s.id)) {
        abnormalList.push({
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
        usedIds.add(s.id);
      }
    });

    const boardedTargetCount = Math.min(
      Math.max(route.boardedCount, boardedFromDetails.length),
      route.expectedCount
    );
    let boardedAdded = 0;
    for (let i = 0; i < boardedFromDetails.length && boardedAdded < boardedTargetCount; i++) {
      if (!usedIds.has(boardedFromDetails[i].id)) {
        result.push(boardedFromDetails[i]);
        usedIds.add(boardedFromDetails[i].id);
        boardedAdded++;
      }
    }
    while (boardedAdded < boardedTargetCount) {
      const newId = `${routeId}-b-${boardedAdded}`;
      if (!usedIds.has(newId)) {
        result.push({
          id: newId,
          name: `已上车${boardedAdded + 1}`,
          className: '待同步',
          station: '待同步',
          status: 'boarded',
          boardedTime: '待同步',
        });
        usedIds.add(newId);
      }
      boardedAdded++;
    }

    const remainingSlots = route.expectedCount - boardedAdded - abnormalList.length;
    const unconfirmedTargetCount = Math.min(
      Math.max(route.unconfirmedCount, unconfirmedFromDetails.length),
      Math.max(0, remainingSlots)
    );
    let unconfirmedAdded = 0;
    for (let i = 0; i < unconfirmedFromDetails.length && unconfirmedAdded < unconfirmedTargetCount; i++) {
      if (!usedIds.has(unconfirmedFromDetails[i].id)) {
        result.push(unconfirmedFromDetails[i]);
        usedIds.add(unconfirmedFromDetails[i].id);
        unconfirmedAdded++;
      }
    }
    while (unconfirmedAdded < unconfirmedTargetCount) {
      const newId = `${routeId}-u-${unconfirmedAdded}`;
      if (!usedIds.has(newId)) {
        result.push({
          id: newId,
          name: `未确认${unconfirmedAdded + 1}`,
          className: '待同步',
          station: '待同步',
          status: 'unconfirmed',
        });
        usedIds.add(newId);
      }
      unconfirmedAdded++;
    }

    abnormalList.forEach((a) => result.push(a));

    const finalTotal = boardedAdded + unconfirmedAdded + abnormalList.length;
    if (finalTotal < route.expectedCount) {
      const fillCount = route.expectedCount - finalTotal;
      for (let i = 0; i < fillCount; i++) {
        const newId = `${routeId}-f-${i}`;
        if (!usedIds.has(newId)) {
          result.push({
            id: newId,
            name: `待点名${i + 1}`,
            className: '待同步',
            station: '待同步',
            status: 'unconfirmed',
          });
          usedIds.add(newId);
        }
      }
    }

    return result;
  },

  getDisposalActionsByRoute: (routeId) => {
    const { disposalActions } = get();
    return disposalActions
      .filter((a) => a.routeId === routeId)
      .sort((a, b) => b.time.localeCompare(a.time));
  },

  getAllDisposalActions: () => {
    const { disposalActions } = get();
    return [...disposalActions].sort((a, b) => b.time.localeCompare(a.time));
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
