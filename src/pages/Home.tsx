import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import RouteOverview from '../components/RouteOverview';
import AbnormalStudents from '../components/AbnormalStudents';
import ShiftArchive from '../components/ShiftArchive';
import AlertSummary from '../components/AlertSummary';
import { useDashboardStore } from '../store/dashboardStore';

export default function Home() {
  const routes = useDashboardStore((state) => state.routes);
  const students = useDashboardStore((state) => state.students);
  const getAlerts = useDashboardStore((state) => state.getAlerts);
  const simulateDataUpdate = useDashboardStore((state) => state.simulateDataUpdate);

  const [updateCount, setUpdateCount] = useState(0);

  const alerts = getAlerts();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  const handleSimulate = useCallback(() => {
    simulateDataUpdate();
    setUpdateCount((c) => c + 1);
  }, [simulateDataUpdate]);

  useEffect(() => {
    const timer = setInterval(handleSimulate, 10000);
    return () => clearInterval(timer);
  }, [handleSimulate]);

  const stats = {
    totalRoutes: routes.length,
    runningRoutes: routes.filter((r) => r.unconfirmedCount > 0).length,
    completedRoutes: routes.filter((r) => r.unconfirmedCount === 0).length,
    abnormalCount: students.filter((s) => s.followUpStatus !== 'confirmed').length,
    urgentCount: students.filter((s) => s.priority === 1 && s.followUpStatus !== 'confirmed').length,
    dutyOfficer: '王主任（值班校领导）',
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
            <AbnormalStudents />
            <ShiftArchive />
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-600">
          数据每 10 秒自动刷新 · 上次更新：{formatTime(new Date())} · 累计更新 {updateCount} 次
        </div>
      </main>
    </div>
  );
}
