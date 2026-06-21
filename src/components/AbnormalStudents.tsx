import { AlertTriangle, Filter, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import StudentItem from './StudentItem';
import type { Student, AbnormalType, FollowUpStatus } from '../types';
import { followUpStatusLabels } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

type TabType = 'pending' | 'processed';
type FilterType = 'all' | AbnormalType;
type StatusFilterType = 'all' | FollowUpStatus;

export default function AbnormalStudents() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [routeFilter, setRouteFilter] = useState<string>('all');

  const students = useDashboardStore((state) => state.students);
  const routes = useDashboardStore((state) => state.routes);
  const updateStudentFollowUp = useDashboardStore((state) => state.updateStudentFollowUp);

  const pendingStudents = students.filter((s) => s.followUpStatus !== 'confirmed');
  const processedStudents = students.filter((s) => s.followUpStatus === 'confirmed');

  const displayStudents = activeTab === 'pending' ? pendingStudents : processedStudents;

  const filteredStudents = displayStudents.filter((s) => {
    if (filter !== 'all' && s.abnormalType !== filter) return false;
    if (statusFilter !== 'all' && s.followUpStatus !== statusFilter) return false;
    if (routeFilter !== 'all' && s.routeId !== routeFilter) return false;
    return true;
  });

  const urgentCount = pendingStudents.filter((s) => s.priority === 1).length;
  const newCount = pendingStudents.filter((s) => s.isNew).length;

  const typeFilters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `全部 (${displayStudents.length})` },
    { key: 'absent', label: `未到 (${displayStudents.filter(s => s.abnormalType === 'absent').length})` },
    { key: 'wrong_station', label: `错站 (${displayStudents.filter(s => s.abnormalType === 'wrong_station').length})` },
    { key: 'parent_pickup', label: `家长接走 (${displayStudents.filter(s => s.abnormalType === 'parent_pickup').length})` },
  ];

  const statusFilters: { key: StatusFilterType; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'pending', label: '待处理' },
    { key: 'contacted', label: '已联系' },
    { key: 'waiting', label: '等回复' },
    { key: 'confirmed', label: '已确认' },
  ];

  const routeFilters = [
    { key: 'all', label: '全部线路' },
    ...routes.map((r) => ({ key: r.id, label: r.name })),
  ];

  const activeFilterCount = [
    filter !== 'all',
    statusFilter !== 'all',
    routeFilter !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilter('all');
    setStatusFilter('all');
    setRouteFilter('all');
  };

  const tabs: { key: TabType; label: string; count: number; icon: React.ReactNode }[] = [
    { 
      key: 'pending', 
      label: '待处理', 
      count: pendingStudents.length, 
      icon: <AlertTriangle className="w-4 h-4" /> 
    },
    { 
      key: 'processed', 
      label: '已处理', 
      count: processedStudents.length, 
      icon: <CheckCircle2 className="w-4 h-4" /> 
    },
  ];

  return (
    <section className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center relative">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                {newCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">异常学生</h2>
            <p className="text-sm text-slate-400">
              需立即跟进 <span className="text-red-400 font-semibold">{urgentCount}</span> 人
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-dark-900/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-slate-700/50'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex-1 flex bg-dark-900/50 rounded-lg p-1 flex-wrap gap-1">
            {typeFilters.map((f) => (
              <button
                key={f.key}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  filter === f.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {activeFilterCount > 0 && (
            <button
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 px-2 py-1"
              onClick={clearAllFilters}
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>

        {activeTab === 'processed' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 w-16">按状态：</span>
            <div className="flex bg-dark-900/50 rounded-lg p-1 flex-wrap gap-1 flex-1">
              {statusFilters.map((f) => (
                <button
                  key={f.key}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    statusFilter === f.key
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 w-16">按线路：</span>
          <div className="flex bg-dark-900/50 rounded-lg p-1 flex-wrap gap-1 flex-1 max-h-16 overflow-y-auto">
            {routeFilters.map((f) => (
              <button
                key={f.key}
                className={`text-xs px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  routeFilter === f.key
                    ? 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                onClick={() => setRouteFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {filteredStudents.length > 0 ? (
          filteredStudents
            .sort((a, b) => {
              if (activeTab === 'pending') {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.reportTime.localeCompare(a.reportTime);
              }
              return b.followUpTime.localeCompare(a.followUpTime);
            })
            .map((student, index) => (
              <StudentItem
                key={student.id}
                student={student}
                index={index}
                onUpdateStatus={updateStudentFollowUp}
              />
            ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            {activeTab === 'pending' ? (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无待处理异常学生</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>暂无已处理记录</p>
              </>
            )}
          </div>
        )}
      </div>

      {activeTab === 'pending' && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>处理进度：{processedStudents.length} / {students.length} 已确认安全</span>
            <span>点击展开查看详情并更新跟进状态</span>
          </div>
        </div>
      )}
    </section>
  );
}
