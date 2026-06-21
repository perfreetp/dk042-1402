import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Bus,
  Phone,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type { Shift } from '../types';
import { shiftTypeLabels, getTodayDateString } from '../data/mockData';
import { useDashboardStore } from '../store/dashboardStore';

export default function ShiftArchive() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'history'>('today');

  const today = getTodayDateString();
  const shifts = useDashboardStore((state) => state.shifts);
  const routes = useDashboardStore((state) => state.routes);
  const getTodayMorningShifts = useDashboardStore((state) => state.getTodayMorningShifts);

  const todayShifts = getTodayMorningShifts();
  const historyShifts = shifts.filter((s) => s.date !== today || s.shiftType !== 'morning');

  const sortedHistoryShifts = [...historyShifts].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.completedTime.localeCompare(a.completedTime);
  });

  const displayShifts = viewMode === 'today' ? todayShifts : sortedHistoryShifts;

  const incompleteCount = todayShifts.filter(
    (s) => !s.alightingCheck || !s.cabinCheck
  ).length;

  const cabinIncompleteCount = todayShifts.filter((s) => !s.cabinCheck).length;

  const getRoutePhone = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    return route?.caretakerPhone || '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${month}月${day}日 ${weekdays[date.getDay()]}`;
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/-/g, '')}`;
  };

  const getStatusBadge = (shift: Shift) => {
    const isAllChecked = shift.alightingCheck && shift.cabinCheck;
    const isRunning = !shift.completedTime;

    if (isRunning) {
      return {
        text: '运行中',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <Bus className="w-3 h-3" />,
      };
    }
    if (isAllChecked) {
      return {
        text: '已完成',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    }
    return {
      text: '待清查',
      className: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
      icon: <AlertTriangle className="w-3 h-3" />,
    };
  };

  return (
    <section className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center relative">
            <Archive className="w-5 h-5 text-purple-400" />
            {cabinIncompleteCount > 0 && viewMode === 'today' && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                {cabinIncompleteCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">班次归档</h2>
            <p className="text-sm text-slate-400">
              {viewMode === 'today' 
                ? `今日早班 ${todayShifts.length} 辆车 · ${incompleteCount} 辆待清查`
                : `历史记录 ${historyShifts.length} 条`
              }
            </p>
          </div>
        </div>

        <div className="flex bg-dark-900/50 rounded-lg p-1">
          <button
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-md transition-colors ${
              viewMode === 'today'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => setViewMode('today')}
          >
            <Calendar className="w-3.5 h-3.5" />
            今日早班
          </button>
          <button
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-md transition-colors ${
              viewMode === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
            onClick={() => setViewMode('history')}
          >
            <Archive className="w-3.5 h-3.5" />
            历史记录
          </button>
        </div>
      </div>

      {viewMode === 'today' && (
        <div className="mb-4 p-3 bg-gradient-to-r from-dark-900/60 to-dark-900/30 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-400">
                    已完成 {todayShifts.filter(s => s.alightingCheck && s.cabinCheck).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs text-slate-400">
                    运行中 {todayShifts.filter(s => !s.completedTime).length}
                  </span>
                </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-slate-400">
                  缺清查 {cabinIncompleteCount}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {formatDate(today)}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {displayShifts.map((shift, index) => {
          const isExpanded = expandedId === shift.id;
          const isAllChecked = shift.alightingCheck && shift.cabinCheck;
          const isRunning = !shift.completedTime;
          const needsAttention = viewMode === 'today' && (!shift.alightingCheck || !shift.cabinCheck) && shift.completedTime;
          const statusBadge = getStatusBadge(shift);

          return (
            <div
              key={shift.id}
              className={`animate-fade-in ${needsAttention ? 'order-first' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`rounded-xl border transition-all cursor-pointer overflow-hidden
                            ${needsAttention 
                              ? 'bg-red-500/10 border-red-500/40 hover:border-red-500/60' 
                              : isRunning
                              ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
                              : 'bg-dark-900/40 border-slate-700/30 hover:border-slate-600/50'
                            }`}
                onClick={() => setExpandedId(isExpanded ? null : shift.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      {viewMode === 'history' && (
                        <span className="text-xs text-slate-500 font-mono">
                          {formatDate(shift.date)}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          shift.shiftType === 'morning'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {shiftTypeLabels[shift.shiftType]}
                      </span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Bus className="w-4 h-4 text-slate-400" />
                        {shift.routeName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${statusBadge.className}`}>
                        {statusBadge.icon}
                        {statusBadge.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        shift.abnormalCount > 0 
                          ? 'text-red-400 bg-red-500/10 border border-red-500/30' 
                          : 'text-slate-400 bg-slate-700/30'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        异常 {shift.abnormalCount || 0}
                      </span>
                      <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {shift.completedTime || '未完成'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          shift.alightingCheck
                            ? 'bg-green-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {shift.alightingCheck ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">下车点名</div>
                        <div
                          className={`text-sm font-medium ${
                            shift.alightingCheck ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {shift.alightingCheck ? '已完成' : '未完成'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          shift.cabinCheck
                            ? 'bg-green-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        {shift.cabinCheck ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">车厢清查</div>
                        <div
                          className={`text-sm font-medium ${
                            shift.cabinCheck ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {shift.cabinCheck ? '已完成' : '待确认'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">学生数</div>
                        <div className="text-sm font-medium text-white font-mono">
                          {shift.studentCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">照管员</div>
                        <div className="text-sm font-medium text-white">
                          {shift.caretaker}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-2">司机信息</div>
                          <div className="flex items-center justify-between bg-dark-900/50 rounded-lg p-3">
                            <div>
                              <div className="text-sm font-medium text-white">{shift.driver}</div>
                              {shift.alightingCheckTime && (
                                <div className="text-xs text-slate-500">
                                  下车点名: {shift.alightingCheckTime}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-2">照管员信息</div>
                          <div className="flex items-center justify-between bg-dark-900/50 rounded-lg p-3">
                            <div>
                              <div className="text-sm font-medium text-white">{shift.caretaker}</div>
                              {shift.cabinCheckTime && (
                                <div className="text-xs text-slate-500">
                                  车厢清查: {shift.cabinCheckTime}
                                </div>
                              )}
                            </div>
                            <button
                              className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center text-blue-400 transition-colors"
                              onClick={(e) => handleCall(getRoutePhone(shift.routeId), e)}
                              title="联系照管员"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/route/${shift.routeId}`);
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          查看线路详情
                        </button>
                      </div>

                      {!isAllChecked && shift.completedTime && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
                            <div>
                              <div className="text-sm font-medium text-red-400">
                                ⚠️ 紧急提醒：车辆清查未完成
                              </div>
                              <div className="text-xs text-red-400/80 mt-1">
                                请立即联系照管员
                                {!shift.alightingCheck && '确认下车点名'}
                                {!shift.alightingCheck && !shift.cabinCheck && '、'}
                                {!shift.cabinCheck && '完成车厢清查'}
                                ，确保无学生遗留在车上
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayShifts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Archive className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{viewMode === 'today' ? '今日暂无班次记录' : '暂无历史记录'}</p>
          </div>
        )}
      </div>

      {viewMode === 'today' && incompleteCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {incompleteCount} 辆车未完成清查，请优先联系照管员确认
            </span>
            <span className="text-slate-500">点击卡片查看详情并联系</span>
          </div>
        </div>
      )}
    </section>
  );
}
