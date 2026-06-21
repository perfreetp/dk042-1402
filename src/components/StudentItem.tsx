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
  CheckCircle2,
  History,
  Timer,
} from 'lucide-react';
import type { Student, FollowUpStatus } from '../types';
import {
  abnormalTypeLabels,
} from '../data/mockData';
import {
  followUpStatusLabels,
  followUpStatusColors,
  operatorRoleLabels,
  operatorRoleColors,
} from '../types';

interface StudentItemProps {
  student: Student;
  index: number;
  onUpdateStatus: (id: string, status: FollowUpStatus, note: string) => void;
}

export default function StudentItem({ student, index, onUpdateStatus }: StudentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');

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
  const isConfirmed = student.followUpStatus === 'confirmed';

  const nextStatusOptions: { status: FollowUpStatus; label: string; color: string }[] = [
    { status: 'contacted', label: '已联系家长', color: 'bg-blue-600 hover:bg-blue-500' },
    { status: 'waiting', label: '等待回复', color: 'bg-orange-600 hover:bg-orange-500' },
    { status: 'confirmed', label: '已确认安全', color: 'bg-green-600 hover:bg-green-500' },
  ];

  const handleStatusChange = (status: FollowUpStatus) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    onUpdateStatus(student.id, status, followUpNote || followUpStatusLabels[status]);
    setFollowUpNote('');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${student.contactPhone.replace(/-/g, '')}`;
  };

  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden
                  ${student.isNew ? 'animate-glow' : ''} 
                  ${isConfirmed ? 'opacity-70' : ''}
                  transition-all duration-300`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isUrgent && !isConfirmed && (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
          )}
          {isConfirmed && (
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`font-semibold ${isConfirmed ? 'text-slate-400 line-through' : 'text-white'} truncate`}>
                {student.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${colors.badge} text-white`}>
                {abnormalTypeLabels[student.abnormalType]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border ${followUpStatusColors[student.followUpStatus]}`}>
                {followUpStatusLabels[student.followUpStatus]}
              </span>
              {student.isNew && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white new-badge">
                  NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
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
              {student.followUpTime && (
                <span className="flex items-center gap-1 text-blue-400">
                  <History className="w-3 h-3" />
                  {student.followUpTime}
                </span>
              )}
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
          <div className="space-y-4">
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

            {student.followUpRecords.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">跟进时间线</span>
                </div>
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-slate-700/50" />
                  {student.followUpRecords.map((record, idx) => (
                    <div key={record.id} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-dark-800 ${
                        record.status === 'confirmed' ? 'bg-green-500' :
                        record.status === 'contacted' ? 'bg-blue-500' :
                        record.status === 'waiting' ? 'bg-orange-500' : 'bg-slate-500'
                      }`} />
                      <div className="bg-dark-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded border ${followUpStatusColors[record.status]}`}>
                              {followUpStatusLabels[record.status]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${operatorRoleColors[record.operatorRole]}`}>
                              {operatorRoleLabels[record.operatorRole]}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            {record.time}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span className="text-slate-300 font-medium">{record.operator}</span>
                          <span className="mx-1 text-slate-600">·</span>
                          {record.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isConfirmed && (
              <>
                <div>
                  <div className="text-xs text-slate-500 mb-2">跟进备注（可选）</div>
                  <input
                    type="text"
                    className="w-full bg-dark-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="输入跟进说明..."
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-blue-600/30"
                    onClick={handleCall}
                  >
                    <Phone className="w-4 h-4" />
                    一键拨打
                  </button>
                  {nextStatusOptions.map((opt) => (
                    <button
                      key={opt.status}
                      className={`${opt.color} text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(opt.status);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {isConfirmed && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">已确认安全，处理完成</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
