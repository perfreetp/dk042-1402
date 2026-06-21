import { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Bus, CheckCircle, Shield } from 'lucide-react';
import type { DashboardStats } from '../types';

interface HeaderProps {
  stats: Omit<DashboardStats, 'currentTime'>;
}

export default function Header({ stats }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${year}年${month}月${day}日 ${weekdays[date.getDay()]}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour12: false });
  };

  return (
    <header className="bg-dark-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                校车安全调度看板
              </h1>
              <p className="text-sm text-slate-400">
                值班人员：<span className="text-blue-400 font-medium">{stats.dutyOfficer}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">{formatDate(currentTime)}</div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-3xl font-mono font-bold text-white tracking-wider">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>

            <div className="h-16 w-px bg-slate-700" />

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-xs text-red-400">异常学生</div>
                  <div className="text-2xl font-mono font-bold text-red-400">
                    {stats.abnormalCount}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-lg">
                <Bus className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs text-blue-400">运行中</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">
                    {stats.runningRoutes}
                    <span className="text-sm font-normal text-slate-500">/{stats.totalRoutes}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-xs text-green-400">已完成</div>
                  <div className="text-2xl font-mono font-bold text-green-400">
                    {stats.completedRoutes}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
