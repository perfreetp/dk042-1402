import { AlertTriangle, Bus, Phone, Clock, User, ChevronRight, Search, Car, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { AlertItem } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

interface AlertSummaryProps {
  alerts: AlertItem[];
}

export default function AlertSummary({ alerts }: AlertSummaryProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'route' | 'student' | 'cabin_check'>('all');
  const urgeCabinCheck = useDashboardStore((state) => state.urgeCabinCheck);

  const urgentCount = alerts.filter((a) => a.priority === 1).length;
  const routeAlertCount = alerts.filter((a) => a.type === 'route').length;
  const studentAlertCount = alerts.filter((a) => a.type === 'student').length;
  const cabinAlertCount = alerts.filter((a) => a.type === 'cabin_check').length;

  const filteredAlerts = activeFilter === 'all'
    ? alerts
    : alerts.filter((a) => a.type === activeFilter);

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/-/g, '')}`;
  };

  const handleViewRoute = (routeId: string, studentId?: string, isCabinCheck?: boolean) => {
    if (isCabinCheck) {
      navigate(`/route/${routeId}?tab=shift`);
    } else if (studentId) {
      navigate(`/route/${routeId}?student=${studentId}`);
    } else {
      navigate(`/route/${routeId}`);
    }
  };

  const handleUrgeCabinCheck = (routeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    urgeCabinCheck(routeId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'route':
        return <Bus className="w-4 h-4 text-blue-400" />;
      case 'student':
        return <User className="w-4 h-4 text-orange-400" />;
      case 'cabin_check':
        return <Car className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTypeIconBg = (type: string) => {
    switch (type) {
      case 'route':
        return 'bg-blue-500/20';
      case 'student':
        return 'bg-orange-500/20';
      case 'cabin_check':
        return 'bg-red-500/20';
      default:
        return 'bg-yellow-500/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'route':
        return '线路';
      case 'student':
        return '学生';
      case 'cabin_check':
        return '清查';
      default:
        return '告警';
    }
  };

  const filters = [
    { key: 'all' as const, label: '全部', count: alerts.length, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { key: 'route' as const, label: '线路', count: routeAlertCount, icon: <Bus className="w-3.5 h-3.5" /> },
    { key: 'student' as const, label: '学生', count: studentAlertCount, icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'cabin_check' as const, label: '清查', count: cabinAlertCount, icon: <Car className="w-3.5 h-3.5" /> },
  ];

  if (alerts.length === 0) {
    return (
      <section className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-5 animate-fade-in">
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-400">当前无紧急告警</h3>
            <p className="text-sm text-green-400/70">所有线路运行正常，异常学生已处理完毕</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-red-900/30 via-dark-800/60 to-dark-800/60 backdrop-blur-sm rounded-2xl border border-red-500/30 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center relative">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                {urgentCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">大屏告警汇总</h2>
            <p className="text-sm text-slate-400">
              处置工作台 · 需立即处理 <span className="text-red-400 font-semibold">{alerts.length}</span> 项
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Search className="w-3.5 h-3.5" />
          按优先级自动排序
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 bg-dark-900/50 rounded-lg p-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors flex-1 justify-center ${
              activeFilter === filter.key
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.icon}
            {filter.label}
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              activeFilter === filter.key ? 'bg-white/20' : 'bg-slate-700/50'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredAlerts.map((alert, index) => {
          const isCabin = alert.type === 'cabin_check';
          return (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group
                         ${alert.priority === 1
                           ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 hover:border-red-500/50'
                           : 'bg-dark-800/50 border border-slate-700/50 hover:bg-dark-800/70 hover:border-slate-600'
                         } ${alert.type === 'route' ? 'animate-glow' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => {
                if (alert.routeId) {
                  handleViewRoute(alert.routeId, alert.studentId, isCabin);
                }
              }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                             ${getTypeIconBg(alert.type)}`}>
                {getTypeIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {alert.priority === 1 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white font-medium">
                      紧急
                    </span>
                  )}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                    {getTypeLabel(alert.type)}
                  </span>
                  <span className="font-semibold text-white truncate">{alert.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="truncate">{alert.subtitle}</span>
                  <span className="text-slate-600">·</span>
                  <span className={`font-medium ${alert.statusColor}`}>
                    {alert.status}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {alert.reportTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isCabin && (
                  <button
                    className="w-9 h-9 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 flex items-center justify-center transition-colors"
                    onClick={(e) => handleUrgeCabinCheck(alert.routeId!, e)}
                    title="催促清查"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                             ${alert.priority === 1
                               ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                               : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'}`}
                  onClick={(e) => handleCall(alert.contactPhone, e)}
                  title={`联系 ${alert.contactName}`}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-lg bg-slate-700/50 group-hover:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">当前类型无告警</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              紧急 {urgentCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              线路告警 {routeAlertCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              学生异常 {studentAlertCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              待清查 {cabinAlertCount}
            </span>
          </div>
          <span className="text-slate-500">点击跳转至对应位置</span>
        </div>
      </div>
    </section>
  );
}

function CheckCircle2(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
