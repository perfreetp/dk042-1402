import { AlertTriangle, Filter, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import StudentItem from './StudentItem';
import type { Student, AbnormalType, FollowUpStatus } from '../types';
import { followUpStatusLabels } from '../types';

interface AbnormalStudentsProps {
  students: Student[];
  onUpdateStatus: (id: string, status: FollowUpStatus, note: string) => void;
}

type TabType = 'pending' | 'processed';
type FilterType = 'all' | AbnormalType;

export default function AbnormalStudents({ students, onUpdateStatus }: AbnormalStudentsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [filter, setFilter] = useState<FilterType>('all');

  const pendingStudents = students.filter((s) => s.followUpStatus !== 'confirmed');
  const processedStudents = students.filter((s) => s.followUpStatus === 'confirmed');

  const displayStudents = activeTab === 'pending' ? pendingStudents : processedStudents;

  const filteredStudents = displayStudents.filter((s) => {
    if (filter === 'all') return true;
    return s.abnormalType === filter;
  });

  const urgentCount = pendingStudents.filter((s) => s.priority === 1).length;
  const newCount = pendingStudents.filter((s) => s.isNew).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `全部 (${filteredStudents.length})` },
    { key: 'absent', label: `未到 (${filteredStudents.filter(s => s.abnormalType === 'absent').length})` },
    { key: 'wrong_station', label: `错站 (${filteredStudents.filter(s => s.abnormalType === 'wrong_station').length})` },
    { key: 'parent_pickup', label: `家长接走 (${filteredStudents.filter(s => s.abnormalType === 'parent_pickup').length})` },
  ];

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

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500" />
        <div className="flex bg-dark-900/50 rounded-lg p-1 flex-wrap gap-1">
          {filters.map((f) => (
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
                onUpdateStatus={onUpdateStatus}
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
