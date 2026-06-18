import { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  UserPlus,
  CalendarDays,
  Download,
  Trophy,
  Users,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Star,
  ArrowUpDown,
  Award,
  Medal,
  ChevronUp,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { useWorkerStore } from '@/store/useWorkerStore';
import { getWorkerTypeLabel, getStatusLabel, getInitials } from '@/utils/formatters';
import type { Worker, WorkerType, WorkerStatus, SkillTag } from '@/types/worker';

type WorkerTab = 'card' | 'schedule' | 'ranking';
type SortKey = 'totalTasks' | 'completionRate' | 'onTimeRate' | 'complaintRate' | 'avgTaskMinutes' | 'score';

const ALL_SKILLS: SkillTag[] = [
  { id: 'SK001', name: '家具拆装', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'SK002', name: '钢琴搬运', color: 'bg-amber-100 text-amber-700' },
  { id: 'SK003', name: '保险柜搬运', color: 'bg-rose-100 text-rose-700' },
  { id: 'SK004', name: '持证司机', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'SK005', name: '家具组装', color: 'bg-blue-100 text-blue-700' },
  { id: 'SK006', name: '高层吊装', color: 'bg-purple-100 text-purple-700' },
  { id: 'SK007', name: '易碎品搬运', color: 'bg-orange-100 text-orange-700' },
  { id: 'SK008', name: '定制家具拆装', color: 'bg-indigo-100 text-indigo-700' },
];

const WORKER_STATUS_DOT: Record<WorkerStatus, string> = {
  ON_DUTY: 'bg-green-500',
  OFF_DUTY: 'bg-neutral-400',
  ON_LEAVE: 'bg-purple-500',
  ON_TASK: 'bg-orange-500',
};

interface ShiftDay {
  date: Date;
  dateNum: number;
  dayName: string;
  shift: '早班' | '中班' | '晚班' | '休' | null;
  isToday: boolean;
}

const generateWeekData = (): ShiftDay[][] => {
  const today = new Date('2026-06-18');
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(today.getDate() + diff);

  const workers = useWorkerStore.getState().workers;
  const workerCount = Math.min(workers.length, 6);

  const shifts: ('早班' | '中班' | '晚班' | '休')[] = ['早班', '中班', '晚班', '早班', '中班', '休', '早班'];
  const week: ShiftDay[][] = [];

  for (let w = 0; w < workerCount; w++) {
    const row: ShiftDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + d);
      const shiftIdx = (d + w) % 7;
      row.push({
        date,
        dateNum: date.getDate(),
        dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        shift: shifts[shiftIdx],
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    week.push(row);
  }
  return week;
};

function MiniProgress({ value, color }: { value: number; color: 'green' | 'orange' | 'red' | 'blue' }) {
  const colorMap = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden min-w-[40px]">
        <div
          className={`h-full rounded-full ${colorMap[color]}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-neutral-700 min-w-[38px] text-right">{value.toFixed(1)}%</span>
    </div>
  );
}

function WorkerCard({ worker }: { worker: Worker }) {
  const typeLabel = getWorkerTypeLabel(worker.type);
  const statusLabel = getStatusLabel(worker.status, 'worker');
  const statusColor = WORKER_STATUS_DOT[worker.status];

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-accent-amber flex items-center justify-center text-white font-bold text-xl">
            {getInitials(worker.name)}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${statusColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 text-base truncate">{worker.name}</h3>
            <span className={`chip ${worker.type === 'INTERNAL' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
              {typeLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="text-xs text-neutral-600">{statusLabel}</span>
            {worker.location && (
              <>
                <span className="text-neutral-300 mx-0.5">·</span>
                <span className="text-xs text-neutral-500 truncate">{worker.location}</span>
              </>
            )}
          </div>
          {worker.teamName && (
            <p className="text-xs text-neutral-500 truncate">{worker.teamName} · 师傅</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {worker.skills.slice(0, 4).map((skill) => (
          <span key={skill.id} className={`chip ${skill.color}`}>
            {skill.name}
          </span>
        ))}
        {worker.skills.length > 4 && (
          <span className="chip bg-neutral-100 text-neutral-600">+{worker.skills.length - 4}</span>
        )}
      </div>

      <div className="space-y-2.5 mb-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-neutral-500">完工率</span>
          </div>
          <MiniProgress value={worker.metrics.completionRate} color="green" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-neutral-500">准时率</span>
          </div>
          <MiniProgress value={worker.metrics.onTimeRate} color="blue" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-neutral-500">投诉率</span>
          </div>
          <MiniProgress value={Math.min(100, worker.metrics.complaintRate * 20)} color={worker.metrics.complaintRate > 1 ? 'red' : 'orange'} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="px-2 py-0.5 rounded-md bg-brand-orange/10 text-brand-orange-dark font-semibold tabular-nums">
            {worker.todayTaskCount}
          </span>
          <span className="text-xs text-neutral-500">今日任务</span>
        </div>
        <button className="btn-ghost !py-1.5 !px-3 text-xs ml-auto">
          <Eye className="w-3.5 h-3.5" />
          详情
        </button>
      </div>
    </div>
  );
}

export default function Workers() {
  const [activeTab, setActiveTab] = useState<WorkerTab>('card');
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<WorkerType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'ALL'>('ALL');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const { workers } = useWorkerStore();

  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (searchValue) {
        const kw = searchValue.toLowerCase();
        if (!w.name.toLowerCase().includes(kw) && !w.phone.includes(kw)) return false;
      }
      if (typeFilter !== 'ALL' && w.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;
      if (skillFilter && !w.skills.some((s) => s.id === skillFilter)) return false;
      return true;
    });
  }, [workers, searchValue, typeFilter, statusFilter, skillFilter]);

  const stats = useMemo(() => {
    const total = workers.length;
    const onDuty = workers.filter((w) => w.status === 'ON_DUTY' || w.status === 'ON_TASK').length;
    const internal = workers.filter((w) => w.type === 'INTERNAL').length;
    const outsource = workers.filter((w) => w.type === 'OUTSOURCE').length;
    const avgCompletion = workers.length > 0
      ? Math.round(workers.reduce((s, w) => s + w.metrics.completionRate, 0) / workers.length * 10) / 10
      : 0;
    const avgComplaint = workers.length > 0
      ? Math.round(workers.reduce((s, w) => s + w.metrics.complaintRate, 0) / workers.length * 100) / 100
      : 0;
    return { total, onDuty, internal, outsource, avgCompletion, avgComplaint };
  }, [workers]);

  const weekData = useMemo(() => generateWeekData(), []);

  const rankingData = useMemo(() => {
    const list = workers.map((w) => {
      const score = Math.round(
        w.metrics.completionRate * 0.4 +
        w.metrics.onTimeRate * 0.3 +
        (100 - Math.min(100, w.metrics.complaintRate * 30)) * 0.2 +
        Math.max(0, (800 - w.metrics.avgTaskMinutes)) * 0.025
      );
      return { ...w, score: Math.min(100, score) };
    });
    list.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'totalTasks':
          av = a.metrics.totalTasks; bv = b.metrics.totalTasks; break;
        case 'completionRate':
          av = a.metrics.completionRate; bv = b.metrics.completionRate; break;
        case 'onTimeRate':
          av = a.metrics.onTimeRate; bv = b.metrics.onTimeRate; break;
        case 'complaintRate':
          av = a.metrics.complaintRate; bv = b.metrics.complaintRate; break;
        case 'avgTaskMinutes':
          av = a.metrics.avgTaskMinutes; bv = b.metrics.avgTaskMinutes; break;
        case 'score':
        default:
          av = a.score; bv = b.score; break;
      }
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [workers, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'complaintRate' || key === 'avgTaskMinutes');
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-3 py-3 text-left font-medium text-neutral-600 text-xs cursor-pointer hover:bg-neutral-100/50 select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-3 h-3 transition-colors ${sortKey === field ? 'text-brand-orange' : 'text-neutral-400'}`} />
        {sortKey === field && (
          sortAsc ? <ChevronUp className="w-3 h-3 text-brand-orange -ml-1" /> : <ChevronDown className="w-3 h-3 text-brand-orange -ml-1" />
        )}
      </span>
    </th>
  );

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-amber-50 border-amber-200';
    if (rank === 2) return 'bg-slate-50 border-slate-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return '';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
    return <span className="text-sm font-semibold text-neutral-500 tabular-nums w-5 text-center">{rank}</span>;
  };

  const shiftColor = (shift: ShiftDay['shift']) => {
    switch (shift) {
      case '早班': return 'bg-sky-50 text-sky-700 border-sky-200';
      case '中班': return 'bg-violet-50 text-violet-700 border-violet-200';
      case '晚班': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '休': return 'bg-neutral-50 text-neutral-400 border-neutral-200';
      default: return 'bg-white border-neutral-100';
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索姓名或手机号..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => { setTypeDropdownOpen(!typeDropdownOpen); setStatusDropdownOpen(false); setSkillDropdownOpen(false); }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Users className="w-4 h-4 text-neutral-500" />
              {typeFilter === 'ALL' ? '全部类型' : getWorkerTypeLabel(typeFilter)}
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {typeDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in">
                {[{ value: 'ALL', label: '全部类型' }, { value: 'INTERNAL', label: '内部师傅' }, { value: 'OUTSOURCE', label: '外包师傅' }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setTypeFilter(opt.value as WorkerType | 'ALL'); setTypeDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      typeFilter === opt.value
                        ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setTypeDropdownOpen(false); setSkillDropdownOpen(false); }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Clock className="w-4 h-4 text-neutral-500" />
              {statusFilter === 'ALL' ? '全部状态' : getStatusLabel(statusFilter, 'worker')}
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in">
                {[{ value: 'ALL', label: '全部状态' }, { value: 'ON_DUTY', label: '在岗' }, { value: 'ON_TASK', label: '任务中' }, { value: 'OFF_DUTY', label: '下班' }, { value: 'ON_LEAVE', label: '休假' }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value as WorkerStatus | 'ALL'); setStatusDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      statusFilter === opt.value
                        ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setSkillDropdownOpen(!skillDropdownOpen); setTypeDropdownOpen(false); setStatusDropdownOpen(false); }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Star className="w-4 h-4 text-neutral-500" />
              {skillFilter ? ALL_SKILLS.find((s) => s.id === skillFilter)?.name : '技能标签'}
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${skillDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {skillDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in max-h-72 overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => { setSkillFilter(''); setSkillDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    !skillFilter
                      ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  全部技能
                </button>
                {ALL_SKILLS.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => { setSkillFilter(skill.id); setSkillDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      skillFilter === skill.id
                        ? 'bg-brand-orange/10 text-brand-orange-dark font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${skill.color.split(' ')[0].replace('text-', 'bg-').replace('-100', '-500').replace('-700', '-500')}`} />
                    {skill.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-secondary">
              <UserPlus className="w-4 h-4" />
              添加师傅
            </button>
            <button className="btn-secondary">
              <CalendarDays className="w-4 h-4" />
              批量排班
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4" />
              导出绩效
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard
          title="师傅总数"
          value={stats.total}
          suffix="人"
          icon={Users}
          colorScheme="blue"
          trend={{ value: 8, label: '较上月' }}
        />
        <StatCard
          title="在岗人数"
          value={stats.onDuty}
          suffix="人"
          icon={UserCheck}
          colorScheme="green"
        />
        <StatCard
          title="内部/外包"
          value={`${stats.internal} / ${stats.outsource}`}
          icon={Building2}
          colorScheme="orange"
        />
        <StatCard
          title="平均完工率"
          value={stats.avgCompletion}
          suffix="%"
          icon={CheckCircle2}
          colorScheme="cyan"
          trend={{ value: 2, label: '较上月' }}
        />
        <StatCard
          title="平均投诉率"
          value={stats.avgComplaint}
          suffix="%"
          icon={AlertCircle}
          colorScheme="rose"
          trend={{ value: -0.3, label: '较上月' }}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center border-b border-neutral-100 px-2">
          <button
            onClick={() => setActiveTab('card')}
            className={`tab-btn ${activeTab === 'card' ? 'tab-active' : 'tab-inactive'}`}
          >
            <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            卡片视图
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`tab-btn ${activeTab === 'schedule' ? 'tab-active' : 'tab-inactive'}`}
          >
            <CalendarDays className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            排班日历
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`tab-btn ${activeTab === 'ranking' ? 'tab-active' : 'tab-inactive'}`}
          >
            <Trophy className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            绩效排行
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'card' && (
            filteredWorkers.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">暂无符合条件的师傅</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            )
          )}

          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 text-xs bg-neutral-50 rounded-tl-lg sticky left-0 z-10 w-40 border-b border-neutral-100">
                      师傅 / 日期
                    </th>
                    {weekData[0]?.map((d, i) => (
                      <th key={i} className={`px-3 py-3 text-center font-medium text-xs border-b border-neutral-100 min-w-[110px] ${
                        d.isToday ? 'bg-brand-orange/5' : 'bg-neutral-50'
                      } ${i === 6 ? 'rounded-tr-lg' : ''}`}>
                        <div className="text-neutral-500 mb-1">{d.dayName}</div>
                        <div className={`text-lg font-bold tabular-nums ${d.isToday ? 'text-brand-orange' : 'text-neutral-800'}`}>
                          {d.dateNum}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekData.map((row, wIdx) => {
                    const worker = workers[wIdx];
                    return (
                      <tr key={wIdx} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                        <td className="px-4 py-3 sticky left-0 bg-white z-10 border-b border-neutral-50 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-orange to-accent-amber flex items-center justify-center text-white font-semibold text-sm shrink-0">
                              {getInitials(worker?.name || '师')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-neutral-800 text-sm truncate">{worker?.name}</div>
                              <div className="text-xs text-neutral-500 truncate">{worker?.teamName}</div>
                            </div>
                          </div>
                        </td>
                        {row.map((day, dIdx) => (
                          <td key={dIdx} className={`px-2 py-3 text-center border-b border-neutral-50 last:border-0 ${
                            day.isToday ? 'bg-brand-orange/5 ring-2 ring-inset ring-brand-orange/30' : ''
                          }`}>
                            {day.shift && (
                              <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-medium ${shiftColor(day.shift)}`}>
                                {day.shift}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="overflow-x-auto rounded-xl border border-neutral-100">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-neutral-600 text-xs w-16">排名</th>
                    <th className="px-3 py-3 text-left font-medium text-neutral-600 text-xs">师傅</th>
                    <th className="px-3 py-3 text-left font-medium text-neutral-600 text-xs">团队</th>
                    <th className="px-3 py-3 text-left font-medium text-neutral-600 text-xs">类型</th>
                    <SortHeader label="总单量" field="totalTasks" />
                    <SortHeader label="完工率" field="completionRate" />
                    <SortHeader label="准时率" field="onTimeRate" />
                    <SortHeader label="投诉率" field="complaintRate" />
                    <SortHeader label="平均耗时" field="avgTaskMinutes" />
                    <SortHeader label="综合评分" field="score" />
                    <th className="px-3 py-3 text-center font-medium text-neutral-600 text-xs">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rankingData.map((w, idx) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    return (
                      <tr
                        key={w.id}
                        className={`transition-colors hover:bg-neutral-50/50 ${getRankBg(rank)} border-l-4 ${
                          rank === 1 ? 'border-l-amber-400' :
                          rank === 2 ? 'border-l-slate-400' :
                          rank === 3 ? 'border-l-orange-400' :
                          'border-l-transparent'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${
                              isTop3
                                ? rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                                : rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                                : 'bg-gradient-to-br from-orange-400 to-orange-600'
                                : 'bg-gradient-to-br from-brand-orange to-accent-amber'
                            }`}>
                              {getInitials(w.name)}
                            </div>
                            <div>
                              <div className="font-medium text-neutral-800">{w.name}</div>
                              <div className="text-xs text-neutral-500">{w.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-neutral-700 text-xs">{w.teamName || '-'}</td>
                        <td className="px-3 py-3">
                          <span className={`chip ${w.type === 'INTERNAL' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
                            {getWorkerTypeLabel(w.type)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-neutral-700 font-medium tabular-nums">{w.metrics.totalTasks}</td>
                        <td className="px-3 py-3">
                          <span className="text-green-700 font-medium tabular-nums">{w.metrics.completionRate.toFixed(1)}%</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-blue-700 font-medium tabular-nums">{w.metrics.onTimeRate.toFixed(1)}%</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`font-medium tabular-nums ${
                            w.metrics.complaintRate > 1 ? 'text-red-600' :
                            w.metrics.complaintRate > 0.5 ? 'text-orange-600' :
                            'text-green-700'
                          }`}>{w.metrics.complaintRate.toFixed(1)}%</span>
                        </td>
                        <td className="px-3 py-3 text-neutral-700 tabular-nums">{w.metrics.avgTaskMinutes}分钟</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold tabular-nums ${
                              isTop3
                                ? rank === 1 ? 'text-amber-600'
                                : rank === 2 ? 'text-slate-600'
                                : 'text-orange-600'
                                : 'text-neutral-800'
                            }`}>{w.score}</span>
                            {isTop3 && <Star className={`w-3.5 h-3.5 fill-current ${
                              rank === 1 ? 'text-amber-400' :
                              rank === 2 ? 'text-slate-400' :
                              'text-orange-400'
                            }`} />}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button className="btn-ghost !py-1 !px-2.5 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            详情
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
