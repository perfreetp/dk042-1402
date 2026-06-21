import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import RouteOverview from '../components/RouteOverview';
import AbnormalStudents from '../components/AbnormalStudents';
import ShiftArchive from '../components/ShiftArchive';
import { initialRoutes, initialStudents, initialShifts, dutyOfficer } from '../data/mockData';
import type { Route, Student, Shift } from '../types';

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [updateCount, setUpdateCount] = useState(0);

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

  const handleResolveStudent = (studentId: string) => {
    setTimeout(() => {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    }, 500);
  };

  const stats = {
    totalRoutes: routes.length,
    runningRoutes: routes.filter((r) => r.unconfirmedCount > 0).length,
    completedRoutes: routes.filter((r) => r.unconfirmedCount === 0).length,
    abnormalCount: students.filter((s) => !s.isNew || s.isNew).length,
    dutyOfficer: dutyOfficer,
  };

  return (
    <div className="min-h-screen bg-grid">
      <Header stats={stats} />

      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RouteOverview routes={routes} />
          </div>

          <div className="space-y-6">
            <AbnormalStudents students={students} onResolve={handleResolveStudent} />
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
