import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Phone,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  MessageSquare,
  XCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import type { Student } from '../types';
import { abnormalTypeLabels } from '../data/mockData';

interface StudentItemProps {
  student: Student;
  index: number;
  onResolve: (id: string) => void;
}

export default function StudentItem({ student, index, onResolve }: StudentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const typeColors = {
    absent: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500',
    },
    wrong_station: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500',
    },
    parent_pickup: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500',
    },
  };

  const colors = typeColors[student.abnormalType];
  const isUrgent = student.priority === 1;

  const handleResolve = () => {
    setIsResolved(true);
    onResolve(student.id);
  };

  if (isResolved) {
    return (
      <div
        className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 opacity-60"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-slate-400 line-through">{student.name}</span>
          <span className="text-xs text-green-400 ml-auto">已处理</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden
                  ${student.isNew ? 'animate-glow' : ''} transition-all duration-300`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isUrgent && (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white truncate">{student.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${colors.badge} text-white`}>
                {abnormalTypeLabels[student.abnormalType]}
              </span>
              {student.isNew && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white new-badge">
                  NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {student.className}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {student.station}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {student.reportTime}
              </span>
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 mb-1">照管员备注</div>
                <div className="text-sm text-slate-300">{student.caretakerNote}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500 mb-1">建议联系</div>
                <div className="text-sm text-slate-300">{student.contactPerson}</div>
                <div className="text-sm font-mono text-blue-400">{student.contactPhone}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Phone className="w-4 h-4" />
                一键拨打
              </button>
              <button
                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-green-600/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResolve();
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                标记已处理
              </button>
              <button
                className="bg-slate-700/50 hover:bg-slate-700 text-slate-400 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                title="忽略"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
