import { AlertTriangle, Bus, Phone, Clock, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AlertItem } from '../types';

interface AlertSummaryProps {
  alerts: AlertItem[];
}

export default function AlertSummary({ alerts }: AlertSummaryProps) {
  const navigate = useNavigate();

  const urgentCount = alerts.filter((a) => a.priority === 1).length;
  const abnormalRouteCount = alerts.filter((a) => a.type === 'route' && a.priority === 1).length;
  const delayedRouteCount = alerts.filter((a) => a.type === 'route' && a.priority === 2).length;
  const pendingStudentCount = alerts.filter((a) => a.type === 'student' && a.priority === 2).length;

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/-/g, '')}`;
  };

  const handleViewRoute = (routeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/route/${routeId}`);
  };

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
              需立即处理 <span className="text-red-400 font-semibold">{alerts.length}</span> 项
              <span className="mx-2 text-slate-600">|</span>
              紧急 <span className="text-red-400 font-semibold">{urgentCount}</span> 项
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          按优先级自动排序
        </div>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer
                       ${alert.priority === 1 
                         ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/15' 
                         : 'bg-dark-800/50 border border-slate-700/50 hover:bg-dark-800/70'
                       } ${alert.type === 'route' ? 'animate-glow' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={(e) => {
              if (alert.type === 'route' && alert.routeId) {
                handleViewRoute(alert.routeId, e);
              }
            }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                           ${alert.type === 'route' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
              {alert.type === 'route' ? (
                <Bus className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-orange-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {alert.priority === 1 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white font-medium">
                    紧急
                  </span>
                )}
                <span className="font-semibold text-white truncate">{alert.title}</span>
                <span className={`text-xs font-medium ${alert.statusColor}`}>
                  {alert.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="truncate">{alert.subtitle}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {alert.reportTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                           ${alert.priority === 1 
                             ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                             : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'}`}
                onClick={(e) => handleCall(alert.contactPhone, e)}
                title={`联系 ${alert.contactName}`}
              >
                <Phone className="w-4 h-4" />
              </button>
              {alert.type === 'route' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              异常车辆 {abnormalRouteCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              延迟车辆 {delayedRouteCount}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              待处理学生 {pendingStudentCount}
            </span>
          </div>
          <span className="text-slate-500">点击线路卡片查看详情</span>
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
