import { AlertTriangle, Filter } from 'lucide-react';
import { useState } from 'react';
import StudentItem from './StudentItem';
import type { Student, AbnormalType } from '../types';

interface AbnormalStudentsProps {
  students: Student[];
  onResolve: (id: string) => void;
}

type FilterType = 'all' | AbnormalType;

export default function AbnormalStudents({ students, onResolve }: AbnormalStudentsProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredStudents = students.filter((s) => {
    if (filter === 'all') return true;
    return s.abnormalType === filter;
  });

  const urgentCount = students.filter((s) => s.priority === 1).length;
  const newCount = students.filter((s) => s.isNew).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `全部 (${students.length})` },
    { key: 'absent', label: `未到 (${students.filter(s => s.abnormalType === 'absent').length})` },
    { key: 'wrong_station', label: `错站 (${students.filter(s => s.abnormalType === 'wrong_station').length})` },
    { key: 'parent_pickup', label: `家长接走 (${students.filter(s => s.abnormalType === 'parent_pickup').length})` },
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

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex bg-dark-900/50 rounded-lg p-1">
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
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredStudents.length > 0 ? (
          filteredStudents
            .sort((a, b) => a.priority - b.priority)
            .map((student, index) => (
              <StudentItem
                key={student.id}
                student={student}
                index={index}
                onResolve={onResolve}
              />
            ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无异常学生</p>
          </div>
        )}
      </div>
    </section>
  );
}
