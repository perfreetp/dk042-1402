import { User, MapPin, Clock, Users } from 'lucide-react';
import type { Route } from '../types';
import { statusLabels } from '../data/mockData';

interface RouteCardProps {
  route: Route;
  index: number;
}

export default function RouteCard({ route, index }: RouteCardProps) {
  const statusColors = {
    normal: {
      bg: 'bg-green-500/10',
      border: 'status-border-normal',
      text: 'text-green-400',
      dot: 'bg-green-400',
    },
    delayed: {
      bg: 'bg-orange-500/10',
      border: 'status-border-delayed',
      text: 'text-orange-400',
      dot: 'bg-orange-400',
    },
    abnormal: {
      bg: 'bg-red-500/10',
      border: 'status-border-abnormal',
      text: 'text-red-400',
      dot: 'bg-red-400',
    },
  };

  const colors = statusColors[route.status];
  const completionRate = Math.round((route.boardedCount / route.expectedCount) * 100);

  return (
    <div
      className={`bg-dark-800/60 backdrop-blur-sm rounded-xl ${colors.border} ${colors.bg} 
                  card-hover animate-slide-up overflow-hidden`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${colors.dot} ${route.status === 'abnormal' ? 'animate-pulse-fast' : ''}`} />
              <span className="text-lg font-bold text-white">{route.name}</span>
              <span className="text-xs text-slate-500 font-mono bg-slate-700/50 px-2 py-0.5 rounded">
                {route.routeNumber}
              </span>
            </div>
            <span className={`text-sm font-medium ${colors.text}`}>
              {statusLabels[route.status]}
            </span>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{route.lastUpdate}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <User className="w-4 h-4 text-blue-400" />
            <span>司机：{route.driver}</span>
            <span className="text-slate-600">|</span>
            <span>照管：{route.caretaker}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>{route.currentLocation}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>点名进度</span>
            <span className="font-mono">{completionRate}%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                route.status === 'abnormal' ? 'bg-red-500' :
                route.status === 'delayed' ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Users className="w-3 h-3" />
              <span>应乘</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white number-transition">
              {route.expectedCount}
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-green-400 mb-1">已上车</div>
            <div className="text-2xl font-mono font-bold text-green-400 number-transition">
              {route.boardedCount}
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-lg p-3 text-center">
            <div className="text-xs text-red-400 mb-1">未确认</div>
            <div className={`text-2xl font-mono font-bold number-transition ${
              route.unconfirmedCount > 0 ? 'text-red-400' : 'text-slate-500'
            }`}>
              {route.unconfirmedCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
