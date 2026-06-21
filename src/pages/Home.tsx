import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import RouteOverview from '../components/RouteOverview';
import AbnormalStudents from '../components/AbnormalStudents';
import ShiftArchive from '../components/ShiftArchive';
import AlertSummary from '../components/AlertSummary';
import { initialRoutes, initialStudents, initialShifts, dutyOfficer } from '../data/mockData';
import type { Route, Student, Shift, AlertItem } from '../types';

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [updateCount, setUpdateCount] = useState(0);

  const alerts = useMemo<AlertItem[]>(() => {
    const result: AlertItem[] = [];
    const statusLabels = { normal: '正常', delayed: '延迟', abnormal: '异常' };
    const abnormalTypeLabels = { absent: '未到', wrong_station: '错站', parent_pickup: '家长接走' };

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
        });
      }
    });

    students.forEach((student) => {
      if (student.followUpStatus !== 'confirmed') {
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
        });
      }
    });

    return result.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.reportTime.localeCompare(a.reportTime);
    });
  }, [routes, students]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  const simulateDataUpdate = useCallback(() => {
    setRoutes((prevRoutes) => {
      return prevRoutes.map((route) => {
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
            status: 'delayed',
            lastUpdate: formatTime(new Date()),
          };
        }

        return route;
      });
    });

    setUpdateCount((c) => c + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(simulateDataUpdate, 10000);
    return () => clearInterval(timer);
  }, [simulateDataUpdate]);

  const handleUpdateStudentStatus = (studentId: string, status: 'contacted' | 'waiting' | 'confirmed', note: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              followUpStatus: status,
              followUpNote: note,
              followUpTime: formatTime(new Date()),
              isNew: false,
            }
          : s
      )
    );
  };

  const stats = {
    totalRoutes: routes.length,
    runningRoutes: routes.filter((r) => r.unconfirmedCount > 0).length,
    completedRoutes: routes.filter((r) => r.unconfirmedCount === 0).length,
    abnormalCount: students.filter((s) => s.followUpStatus !== 'confirmed').length,
    urgentCount: students.filter((s) => s.priority === 1 && s.followUpStatus !== 'confirmed').length,
    dutyOfficer: dutyOfficer,
  };

  return (
    <div className="min-h-screen bg-grid">
      <Header stats={stats} />

      <main className="p-6">
        {alerts.length > 0 && (
          <div className="mb-6">
            <AlertSummary alerts={alerts} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RouteOverview routes={routes} />
          </div>

          <div className="space-y-6">
            <AbnormalStudents students={students} onUpdateStatus={handleUpdateStudentStatus} />
            <ShiftArchive shifts={shifts} />
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-600">
          数据每 10 秒自动刷新 · 上次更新：{formatTime(new Date())} · 累计更新 {updateCount} 次
        </div>
      </main>
    </div>
  );
}
