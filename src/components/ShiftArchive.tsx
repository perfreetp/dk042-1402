import { useState } from 'react';
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
} from 'lucide-react';
import type { Shift } from '../types';
import { shiftTypeLabels } from '../data/mockData';

interface ShiftArchiveProps {
  shifts: Shift[];
}

export default function ShiftArchive({ shifts }: ShiftArchiveProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const sortedShifts = [...shifts].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.completedTime.localeCompare(a.completedTime);
  });

  return (
    <section className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Archive className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">班次归档</h2>
          <p className="text-sm text-slate-400">历史班次记录与清查确认</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 timeline-line">
        {sortedShifts.map((shift, index) => {
          const isExpanded = expandedId === shift.id;
          const isAllChecked = shift.alightingCheck && shift.cabinCheck;

          return (
            <div
              key={shift.id}
              className="relative pl-8 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`absolute left-0 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isAllChecked
                    ? 'border-green-500 bg-green-500/20'
                    : shift.abnormalCount > 0
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-yellow-500 bg-yellow-500/20'
                }`}
              >
                {isAllChecked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                )}
              </div>

              <div
                className={`bg-dark-900/40 rounded-xl border border-slate-700/30 
                            hover:border-slate-600/50 transition-all cursor-pointer
                            ${!isAllChecked ? 'border-l-4 border-l-yellow-500' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : shift.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">
                        {formatDate(shift.date)}
                      </span>
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
                    </div>

                    <div className="flex items-center gap-3">
                      {shift.abnormalCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          异常 {shift.abnormalCount}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        {shift.completedTime}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        司机 {shift.driver}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span>照管 {shift.caretaker}</span>
                      <span className="text-slate-600">|</span>
                      <span className="font-mono">学生 {shift.studentCount} 人</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
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
                            <div className="text-sm font-medium text-white">
                              下车点名
                            </div>
                            <div
                              className={`text-xs ${
                                shift.alightingCheck
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {shift.alightingCheck ? '已完成' : '未完成'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                            <div className="text-sm font-medium text-white">
                              车厢清查
                            </div>
                            <div
                              className={`text-xs ${
                                shift.cabinCheck
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {shift.cabinCheck ? '已完成' : '待确认'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isAllChecked && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-yellow-400">
                                操作提醒
                              </div>
                              <div className="text-xs text-yellow-400/80">
                                请联系照管员
                                {!shift.alightingCheck && '确认下车点名'}
                                {!shift.alightingCheck && !shift.cabinCheck && '、'}
                                {!shift.cabinCheck && '完成车厢清查'}
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

        {sortedShifts.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Archive className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无归档班次</p>
          </div>
        )}
      </div>
    </section>
  );
}
