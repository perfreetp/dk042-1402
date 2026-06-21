import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  User,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Users,
  Shield,
  RefreshCw,
  Activity,
  PhoneCall,
  Timer,
} from 'lucide-react';
import { abnormalTypeLabels } from '../data/mockData';
import {
  studentStatusLabels,
  studentStatusColors,
  actionTypeLabels,
  actionTypeColors,
  operatorRoleLabels,
  operatorRoleColors,
} from '../types';
import type { StudentDetail, StudentStatus, DisposalAction } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeGroup, setActiveGroup] = useState<StudentStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'students' | 'actions'>('students');

  const studentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const getRouteById = useDashboardStore((state) => state.getRouteById);
  const getStudentDetailsByRoute = useDashboardStore((state) => state.getStudentDetailsByRoute);
  const getDisposalActionsByRoute = useDashboardStore((state) => state.getDisposalActionsByRoute);
  const routeStudentDetails = useDashboardStore((state) => state.routeStudentDetails);
  const updateStudentFollowUp = useDashboardStore((state) => state.updateStudentFollowUp);
  const students = useDashboardStore((state) => state.students);

  const route = getRouteById(id || '');
  const hasDetailData = routeStudentDetails[id || ''] !== undefined;
  const studentDetails = getStudentDetailsByRoute(id || '');
  const disposalActions = useMemo(() => getDisposalActionsByRoute(id || ''), [id, getDisposalActionsByRoute]);

  const routeAbnormalStudents = useMemo(
    () => students.filter((s) => s.routeId === id),
    [students, id]
  );

  useEffect(() => {
    const highlightStudentId = searchParams.get('student');
    if (highlightStudentId) {
      setHighlightedId(highlightStudentId);
      setActiveGroup('abnormal');

      setTimeout(() => {
        const element = studentRefs.current[highlightStudentId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75');
            setHighlightedId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, id]);

  const groupedStudents: Record<StudentStatus | 'all', StudentDetail[]> = {
    all: studentDetails,
    boarded: studentDetails.filter((s) => s.status === 'boarded'),
    unconfirmed: studentDetails.filter((s) => s.status === 'unconfirmed'),
    abnormal: studentDetails.filter((s) => s.status === 'abnormal'),
  };

  const displayStudents = groupedStudents[activeGroup];

  const groups: { key: StudentStatus | 'all'; label: string; count: number; color: string }[] = [
    { key: 'all', label: '全部', count: studentDetails.length, color: 'bg-slate-600' },
    { key: 'boarded', label: '已上车', count: groupedStudents.boarded.length, color: 'bg-green-600' },
    { key: 'unconfirmed', label: '未确认', count: groupedStudents.unconfirmed.length, color: 'bg-yellow-600' },
    { key: 'abnormal', label: '异常', count: groupedStudents.abnormal.length, color: 'bg-red-600' },
  ];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/-/g, '')}`;
  };

  if (!route) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <div className="text-center">
          <Bus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">线路不存在</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            返回看板
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    normal: 'bg-green-500/20 text-green-400 border-green-500/30',
    delayed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    abnormal: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusLabels = {
    normal: '正常',
    delayed: '延迟',
    abnormal: '异常',
  };

  const actionIcons: Record<string, React.ReactNode> = {
    contact_parent: <PhoneCall className="w-4 h-4" />,
    waiting_reply: <Timer className="w-4 h-4" />,
    confirm_safety: <CheckCircle2 className="w-4 h-4" />,
    urge_cabin_check: <AlertTriangle className="w-4 h-4" />,
    route_delay: <Timer className="w-4 h-4" />,
    route_abnormal: <AlertTriangle className="w-4 h-4" />,
    cabin_complete: <CheckCircle2 className="w-4 h-4" />,
    boarding_complete: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-grid">
      <header className="bg-dark-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  线路详情 - {route.name}
                </h1>
                <p className="text-sm text-slate-400">
                  <span className="font-mono text-xs bg-slate-700/50 px-2 py-0.5 rounded mr-2">
                    {route.routeNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-xs ${statusColors[route.status]}`}>
                    {statusLabels[route.status]}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">点名进度</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {route.boardedCount}
                    <span className="text-lg text-slate-500">/{route.expectedCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCall(route.caretakerPhone)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    联系照管员
                  </button>
                  <button
                    onClick={() => handleCall(route.driverPhone)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    联系司机
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1">
            <div className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-4">车辆信息</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Bus className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">线路名称</div>
                    <div className="text-white font-semibold">{route.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">司机</div>
                    <div className="text-white font-semibold">{route.driver}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">照管员</div>
                    <div className="text-white font-semibold">{route.caretaker}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">当前位置</div>
                    <div className="text-white font-semibold">{route.currentLocation}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">最后更新</div>
                    <div className="text-white font-semibold font-mono">{route.lastUpdate}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-dark-900/50 rounded-xl">
                <div className="text-xs text-slate-500 mb-2">乘车人数统计</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 mb-1">应乘</div>
                    <div className="text-2xl font-mono font-bold text-white">{route.expectedCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-400 mb-1">已上车</div>
                    <div className="text-2xl font-mono font-bold text-green-400">{route.boardedCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-red-400 mb-1">未确认</div>
                    <div className="text-2xl font-mono font-bold text-red-400">{route.unconfirmedCount}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>完成率</span>
                    <span className="font-mono">{Math.round((route.boardedCount / route.expectedCount) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        route.status === 'abnormal' ? 'bg-red-500' :
                        route.status === 'delayed' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.round((route.boardedCount / route.expectedCount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3">
            <div className="bg-dark-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-5 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-dark-900/50 rounded-lg p-1">
                  <button
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'students'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('students')}
                  >
                    <Users className="w-4 h-4" />
                    学生点名明细
                  </button>
                  <button
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-md transition-colors ${
                      activeTab === 'actions'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('actions')}
                  >
                    <Activity className="w-4 h-4" />
                    处置记录汇总
                    {disposalActions.length > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                        {disposalActions.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {activeTab === 'students' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">学生点名明细</h2>
                        <p className="text-sm text-slate-400">
                          共 {studentDetails.length} 名学生
                          {routeAbnormalStudents.length > 0 && (
                            <span className="ml-2 text-red-400">
                              ({routeAbnormalStudents.length} 名待处理异常)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {groups.map((group) => (
                        <button
                          key={group.key}
                          className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-colors ${
                            activeGroup === group.key
                              ? `${group.color} text-white`
                              : 'bg-dark-900/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                          }`}
                          onClick={() => setActiveGroup(group.key)}
                        >
                          {group.label}
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            activeGroup === group.key ? 'bg-white/20' : 'bg-slate-700/50'
                          }`}>
                            {group.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!hasDetailData && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                        <span className="text-sm text-yellow-400">
                          学生明细数据同步中，当前为实时推算数据（已补齐到应乘人数 {route.expectedCount}），点名信息将陆续更新
                        </span>
                      </div>
                    </div>
                  )}

                  {studentDetails.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">暂无学生点名数据</p>
                      <p className="text-sm mt-2">该线路的学生点名信息尚未同步</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {displayStudents.map((student, index) => {
                        const isHighlighted = highlightedId === student.id;
                        const abnormalStudent = routeAbnormalStudents.find(
                          (s) => s.id === student.id
                        );
                        return (
                          <div
                            key={student.id}
                            ref={(el) => {
                              studentRefs.current[student.id] = el;
                            }}
                            className={`p-4 rounded-xl border transition-all animate-slide-up
                                       ${student.status === 'abnormal'
                                         ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                                         : student.status === 'unconfirmed'
                                         ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                                         : 'bg-dark-900/40 border-slate-700/30 hover:border-slate-600/50'
                                       } ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}`}
                            style={{ animationDelay: `${index * 0.03}s` }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    student.status === 'abnormal'
                                      ? 'bg-red-500/20'
                                      : student.status === 'unconfirmed'
                                      ? 'bg-yellow-500/20'
                                      : 'bg-green-500/20'
                                  }`}
                                >
                                  {student.status === 'abnormal' ? (
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                  ) : student.status === 'unconfirmed' ? (
                                    <HelpCircle className="w-5 h-5 text-yellow-400" />
                                  ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white text-lg">
                                      {student.name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${studentStatusColors[student.status]}`}>
                                      {studentStatusLabels[student.status]}
                                    </span>
                                    {student.abnormalType && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white">
                                        {abnormalTypeLabels[student.abnormalType]}
                                      </span>
                                    )}
                                    {student.className === '待同步' && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                                        信息待同步
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {student.className}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {student.station}
                                    </span>
                                    {student.boardedTime && (
                                      <span className="flex items-center gap-1 text-green-400">
                                        <Clock className="w-3 h-3" />
                                        上车时间 {student.boardedTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {abnormalStudent && (
                                  <div className="text-right mr-4">
                                    <div className="text-xs text-slate-500 mb-1">跟进状态</div>
                                    <div className="text-sm text-slate-300 max-w-xs truncate">
                                      {abnormalStudent.followUpNote || '暂无跟进记录'}
                                    </div>
                                    <div className="text-xs text-blue-400 mt-1">
                                      {abnormalStudent.contactPerson} · {abnormalStudent.contactPhone}
                                    </div>
                                  </div>
                                )}
                                {student.status === 'abnormal' && !abnormalStudent && student.contactPerson && (
                                  <div className="text-right mr-4">
                                    <div className="text-xs text-slate-500 mb-1">照管员备注</div>
                                    <div className="text-sm text-slate-300 max-w-xs truncate">
                                      {student.abnormalNote}
                                    </div>
                                    <div className="text-xs text-blue-400 mt-1">
                                      {student.contactPerson} · {student.contactPhone}
                                    </div>
                                  </div>
                                )}
                                {student.contactPhone && (
                                  <button
                                    onClick={() => handleCall(student.contactPhone)}
                                    className="w-10 h-10 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 flex items-center justify-center text-blue-400 transition-colors"
                                    title={`联系 ${student.contactPerson || '家长'}`}
                                  >
                                    <Phone className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'actions' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">处置记录汇总</h2>
                      <p className="text-sm text-slate-400">
                        {route.name} 从告警到处理的全流程记录
                      </p>
                    </div>
                  </div>

                  {disposalActions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">暂无处置记录</p>
                      <p className="text-sm mt-2">该线路暂未产生异常或处理动作</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {disposalActions.map((action, index) => (
                        <div
                          key={action.id}
                          className="relative pl-12 animate-slide-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {index < disposalActions.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-slate-700/50" />
                          )}

                          <div
                            className={`absolute left-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-dark-800 ${
                              action.priority === 1
                                ? 'bg-red-500/30'
                                : 'bg-slate-700'
                            }`}
                          >
                            {actionIcons[action.type] || <Activity className="w-4 h-4 text-white" />}
                          </div>

                          <div className={`p-4 rounded-xl border transition-all
                                         ${action.priority === 1
                                           ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                           : 'bg-dark-900/40 border-slate-700/30 hover:border-slate-600/50'
                                         }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded border ${actionTypeColors[action.type]}`}>
                                  {actionTypeLabels[action.type]}
                                </span>
                                {action.studentName && (
                                  <span className="text-sm font-semibold text-white">
                                    {action.studentName}
                                  </span>
                                )}
                                {action.priority === 1 && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white">
                                    紧急
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                {action.time}
                              </span>
                            </div>

                            <div className="text-sm text-slate-300 mb-2">
                              {action.description}
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded ${operatorRoleColors[action.operatorRole]}`}>
                                {operatorRoleLabels[action.operatorRole]}
                              </span>
                              <span className="text-slate-400">
                                {action.operator}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
