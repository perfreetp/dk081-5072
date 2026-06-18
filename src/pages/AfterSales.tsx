import { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  User,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Hourglass,
  MessageCircleWarning,
  Edit3,
  Plus,
  Minus,
  Package,
  RefreshCw,
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Send,
  AlertCircle,
  Clock8,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAfterSalesStore } from '@/store/useAfterSalesStore';
import type {
  AfterSalesType,
  AfterSalesOrder,
  AfterSalesStatus,
  ComplaintLevel,
  ComplaintCategory,
  Responsibility,
} from '@/types/aftersales';
import { formatDate, formatDateTime, formatMoney, formatPhone, getInitials } from '@/utils/formatters';
import StatusBadge from '@/components/common/StatusBadge';
import clsx from 'clsx';

type AfterSalesTab = 'ALL' | 'RESCHEDULE' | 'ADD_ITEM' | 'COMPLAINT' | 'RETURN';

const TYPE_CONFIG: Record<AfterSalesType, { label: string; bg: string; text: string; border: string; icon: typeof RefreshCw }> = {
  RESCHEDULE: { label: '改约', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Calendar },
  ADD_ITEM: { label: '加项', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Plus },
  COMPLAINT: { label: '投诉', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: MessageCircleWarning },
  RETURN: { label: '退货', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: RotateCcw },
};

const COMPLAINT_LEVEL_CONFIG: Record<ComplaintLevel, { label: string; bg: string; text: string }> = {
  MINOR: { label: '一般', bg: 'bg-blue-50', text: 'text-blue-700' },
  MAJOR: { label: '严重', bg: 'bg-orange-50', text: 'text-orange-700' },
  CRITICAL: { label: '紧急', bg: 'bg-red-50', text: 'text-red-700' },
};

const COMPLAINT_CATEGORY_OPTIONS: { value: ComplaintCategory; label: string }[] = [
  { value: 'DAMAGE', label: '物品损坏' },
  { value: 'MISSING', label: '物品丢失' },
  { value: 'ATTITUDE', label: '服务态度' },
  { value: 'TIMEOUT', label: '超时延误' },
  { value: 'INSTALLATION', label: '安装问题' },
  { value: 'OTHER', label: '其他' },
];

const RESPONSIBILITY_OPTIONS: { value: Responsibility; label: string }[] = [
  { value: 'WORKER', label: '师傅责任' },
  { value: 'WAREHOUSE', label: '仓储责任' },
  { value: 'CUSTOMER', label: '客户原因' },
  { value: 'FORCE_MAJEURE', label: '不可抗力' },
  { value: 'UNDETERMINED', label: '待认定' },
];

const STATUS_OPTIONS: { value: AfterSalesStatus; label: string }[] = [
  { value: 'PENDING', label: '待处理' },
  { value: 'PROCESSING', label: '处理中' },
  { value: 'RESOLVED', label: '已解决' },
  { value: 'CLOSED', label: '已关闭' },
];

const LEVEL_OPTIONS: { value: ComplaintLevel; label: string }[] = [
  { value: 'MINOR', label: '一般' },
  { value: 'MAJOR', label: '严重' },
  { value: 'CRITICAL', label: '紧急' },
];

const HANDLER_OPTIONS = [
  { value: 'MGR001', label: '客服主管-林静' },
  { value: 'MGR002', label: '售后经理-赵磊' },
  { value: 'CSR001', label: '客服-张晓' },
  { value: 'CSR002', label: '客服-王萌' },
];

const WORKER_OPTIONS = [
  { value: 'WRK004', label: '周文斌' },
  { value: 'WRK006', label: '王志强' },
  { value: 'WRK008', label: '赵永军' },
];

function getTimeRemaining(deadline: string): { text: string; urgent: boolean; overdue: boolean } {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (diff < 0) {
    const absHours = Math.abs(hours);
    const absDays = Math.floor(absHours / 24);
    const absRem = absHours % 24;
    return {
      text: absDays > 0 ? `已超时${absDays}天${absRem}小时` : `已超时${absHours}小时`,
      urgent: true,
      overdue: true,
    };
  }
  if (hours < 24) {
    return { text: `剩余${hours}小时`, urgent: true, overdue: false };
  }
  return { text: `剩余${days}天${remainingHours}小时`, urgent: false, overdue: false };
}

const AVATAR_COLORS = [
  '#F26B3A',
  '#4CC9F0',
  '#E63946',
  '#2D6A4F',
  '#FFBA08',
  '#7209B7',
  '#3A86FF',
  '#06D6A0',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AfterSales() {
  const {
    orders,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
    getStats,
    getFilteredOrders,
  } = useAfterSalesStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const stats = useMemo(() => getStats(), [orders, getStats]);
  const filteredOrders = useMemo(() => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      return getFilteredOrders().filter(
        (o) =>
          o.asNo.toLowerCase().includes(kw) ||
          o.sourceOrderNo.toLowerCase().includes(kw) ||
          o.customerName.includes(kw) ||
          o.customerPhone.includes(kw) ||
          o.description.includes(kw)
      );
    }
    return getFilteredOrders();
  }, [keyword, getFilteredOrders, filters]);

  const selectedOrder = useMemo(
    () => filteredOrders.find((o) => o.id === selectedId) || filteredOrders[0] || null,
    [filteredOrders, selectedId]
  );

  useEffect(() => {
    if (!selectedId && filteredOrders.length > 0) {
      setSelectedId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedId]);

  const tabs: { key: AfterSalesTab; label: string; count: number }[] = [
    { key: 'ALL', label: '全部工单', count: stats.total },
    { key: 'RESCHEDULE', label: '改约/加项', count: stats.reschedule + stats.addItem },
    { key: 'COMPLAINT', label: '投诉处理', count: stats.complaint },
    { key: 'RETURN', label: '退货回库', count: stats.return_ },
  ];

  const handleStatusFilter = (status?: AfterSalesStatus) => {
    setFilters({ ...filters, status });
  };

  return (
    <div className="space-y-5 p-6">
      <FunnelBar stats={stats} />

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5">
          <div className="flex">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all -mb-px',
                  activeTab === key
                    ? 'border-brand-orange text-brand-orange-dark bg-brand-orange/5'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                )}
              >
                {label}
                <span className={clsx(
                  'px-1.5 py-0.5 rounded text-xs font-semibold',
                  activeTab === key ? 'bg-brand-orange text-white' : 'bg-neutral-100 text-neutral-600'
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm">
              <Eye className="w-4 h-4" />
              批量导出
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
          <FilterBar
            keyword={keyword}
            setKeyword={setKeyword}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
          <div className="lg:col-span-3 border-r border-neutral-100 overflow-y-auto max-h-[700px] scrollbar-thin">
            <OrderList
              orders={filteredOrders}
              selectedId={selectedOrder?.id || null}
              onSelect={setSelectedId}
            />
          </div>
          <div className="lg:col-span-2 overflow-y-auto max-h-[700px] scrollbar-thin bg-neutral-50/30">
            {selectedOrder ? (
              <OrderDetail order={selectedOrder} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400">
                <Package className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm">请选择工单查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ stats }: { stats: ReturnType<typeof useAfterSalesStore.getState>['getStats'] extends () => infer R ? R : never }) {
  const stages = [
    { key: 'PENDING', label: '待处理', count: stats.pending, icon: Hourglass, color: 'amber' },
    { key: 'PROCESSING', label: '处理中', count: stats.processing, icon: RefreshCw, color: 'orange' },
    { key: 'RESOLVED', label: '已解决', count: stats.resolved, icon: ShieldCheck, color: 'green' },
    { key: 'CLOSED', label: '已关闭', count: stats.closed, icon: CheckCircle2, color: 'neutral' },
  ];

  const stageColorMap: Record<string, { bg: string; text: string; bar: string }> = {
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400' },
    orange: { bg: 'bg-brand-orange/10', text: 'text-brand-orange-dark', bar: 'bg-brand-orange' },
    green: { bg: 'bg-green-50', text: 'text-green-700', bar: 'bg-green-500' },
    neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600', bar: 'bg-neutral-400' },
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-brand-orange" />
          工单处理漏斗
        </h3>
        <span className="text-xs text-neutral-500">今日实时数据</span>
      </div>
      <div className="flex items-stretch gap-2">
        {stages.map((stage, idx) => {
          const colors = stageColorMap[stage.color];
          const Icon = stage.icon;
          const percent = stats.total > 0 ? Math.round((stage.count / stats.total) * 100) : 0;
          return (
            <div key={stage.key} className="flex-1 flex items-stretch">
              <div className={clsx('flex-1 rounded-xl p-4 relative overflow-hidden transition-all hover:shadow-card-hover', colors.bg)}>
                <div className="flex items-start justify-between mb-2 relative z-10">
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', colors.bar + '/20')}>
                    <Icon className={clsx('w-4.5 h-4.5', colors.text)} />
                  </div>
                  <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full bg-white/60', colors.text)}>
                    {percent}%
                  </span>
                </div>
                <div className="relative z-10">
                  <p className={clsx('text-2xl font-bold tabular-nums', colors.text)}>{stage.count}</p>
                  <p className={clsx('text-xs mt-1 font-medium', colors.text)}>{stage.label}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5">
                  <div
                    className={clsx('h-full transition-all duration-500', colors.bar)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div className="flex items-center px-1">
                  <ChevronRight className="w-5 h-5 text-neutral-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterBar({
  keyword,
  setKeyword,
  filters,
  setFilters,
  resetFilters,
}: {
  keyword: string;
  setKeyword: (v: string) => void;
  filters: ReturnType<typeof useAfterSalesStore.getState>['filters'];
  setFilters: (f: Partial<typeof filters>) => void;
  resetFilters: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="搜索工单编号、订单号、客户、电话..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="input pl-9"
        />
      </div>

      <select
        value={filters.complaintLevel || ''}
        onChange={(e) => setFilters({ ...filters, complaintLevel: (e.target.value as ComplaintLevel) || undefined })}
        className="input max-w-[140px]"
      >
        <option value="">投诉等级</option>
        {LEVEL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={filters.responsibility || ''}
        onChange={(e) => setFilters({ ...filters, responsibility: (e.target.value as Responsibility) || undefined })}
        className="input max-w-[140px]"
      >
        <option value="">责任方</option>
        {RESPONSIBILITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4 text-neutral-400" />
        <input
          type="date"
          className="input max-w-[160px]"
          onChange={(e) => {
            if (e.target.value) {
              setFilters({ ...filters, dateRange: [e.target.value, e.target.value] as [string, string] });
            } else {
              const { dateRange, ...rest } = filters;
              setFilters(rest);
            }
          }}
        />
      </div>

      <select
        value={filters.handlerId || ''}
        onChange={(e) => setFilters({ ...filters, handlerId: e.target.value || undefined })}
        className="input max-w-[180px]"
      >
        <option value="">处理人</option>
        {HANDLER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => {
            const { status, ...rest } = filters;
            setFilters(rest);
          }}
          className={clsx(
            'chip border transition-all cursor-pointer',
            !filters.status ? 'bg-brand-orange/10 text-brand-orange-dark border-brand-orange/20' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          )}
        >
          全部状态
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilters({ ...filters, status: filters.status === s.value ? undefined : s.value })}
            className={clsx(
              'chip border transition-all cursor-pointer',
              filters.status === s.value
                ? s.value === 'PENDING' && 'bg-amber-100 text-amber-700 border-amber-200'
                || s.value === 'PROCESSING' && 'bg-brand-orange/10 text-brand-orange-dark border-brand-orange/20'
                || s.value === 'RESOLVED' && 'bg-green-100 text-green-700 border-green-200'
                || s.value === 'CLOSED' && 'bg-neutral-200 text-neutral-700 border-neutral-300'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={resetFilters} className="btn-ghost text-sm px-3">
        <XCircle className="w-4 h-4" />
        重置
      </button>
    </div>
  );
}

function OrderList({
  orders,
  selectedId,
  onSelect,
}: {
  orders: AfterSalesOrder[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400">
        <Package className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-sm">暂无匹配的工单</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} selected={order.id === selectedId} onClick={() => onSelect(order.id)} />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  selected,
  onClick,
}: {
  order: AfterSalesOrder;
  selected: boolean;
  onClick: () => void;
}) {
  const typeConfig = TYPE_CONFIG[order.type];
  const TypeIcon = typeConfig.icon;
  const timeRemaining = getTimeRemaining(order.deadline);
  const statusIsFinal = order.status === 'RESOLVED' || order.status === 'CLOSED';

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-4 cursor-pointer transition-all relative',
        selected
          ? 'bg-brand-orange/5 shadow-inner'
          : 'hover:bg-neutral-50/70'
      )}
    >
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange rounded-r" />
      )}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={clsx('chip shrink-0 font-semibold border', typeConfig.bg, typeConfig.text, typeConfig.border)}>
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </span>
          {order.complaintLevel && (
            <span className={clsx('chip font-semibold shrink-0', COMPLAINT_LEVEL_CONFIG[order.complaintLevel].bg, COMPLAINT_LEVEL_CONFIG[order.complaintLevel].text)}>
              <AlertTriangle className="w-3 h-3" />
              {COMPLAINT_LEVEL_CONFIG[order.complaintLevel].label}
            </span>
          )}
          <span className="font-mono text-xs font-semibold text-neutral-700 truncate">{order.asNo}</span>
        </div>
        {!statusIsFinal && timeRemaining.urgent && (
          <span className={clsx(
            'chip font-semibold shrink-0 animate-pulse',
            timeRemaining.overdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
          )}>
            <Clock8 className="w-3 h-3" />
            {timeRemaining.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2.5 text-xs">
        <span className="text-neutral-500 font-medium">来源:</span>
        <span className="font-mono text-neutral-700">{order.sourceOrderNo}</span>
        <div className="w-px h-3 bg-neutral-200" />
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: getAvatarColor(order.customerName) }}>
          {getInitials(order.customerName)}
        </div>
        <span className="font-medium text-neutral-800">{order.customerName}</span>
        <span className="text-neutral-500">{formatPhone(order.customerPhone)}</span>
      </div>

      <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {order.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} type="aftersales" size="sm" />
          <span className="text-xs text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(order.createdAt)}
          </span>
        </div>
        {order.handlerName ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
              {getInitials(order.handlerName.replace(/^.*-/, ''))}
            </div>
            <span className="text-xs text-neutral-500">{order.handlerName.replace(/^.*-/, '')}</span>
          </div>
        ) : (
          <span className="chip bg-neutral-100 text-neutral-500">
            <User className="w-3 h-3" />
            待分配
          </span>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: AfterSalesOrder }) {
  const typeConfig = TYPE_CONFIG[order.type];
  const TypeIcon = typeConfig.icon;
  const [remark, setRemark] = useState('');

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx('chip font-semibold border px-2.5 py-1', typeConfig.bg, typeConfig.text, typeConfig.border)}>
              <TypeIcon className="w-4 h-4" />
              {typeConfig.label}工单
            </span>
            {order.complaintLevel && (
              <span className={clsx('chip font-semibold px-2.5 py-1', COMPLAINT_LEVEL_CONFIG[order.complaintLevel].bg, COMPLAINT_LEVEL_CONFIG[order.complaintLevel].text)}>
                <AlertTriangle className="w-4 h-4" />
                {COMPLAINT_LEVEL_CONFIG[order.complaintLevel].label}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-neutral-900">
            {order.asNo}
          </h2>
        </div>
        <StatusBadge status={order.status} type="aftersales" size="md" />
      </div>

      <div className="card p-4 border border-neutral-100">
        <h4 className="font-semibold text-sm text-neutral-800 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-orange" />
          基本信息
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <InfoRow icon={User} label="客户" value={order.customerName} />
          <InfoRow icon={Phone} label="电话" value={formatPhone(order.customerPhone)} />
          <InfoRow icon={FileText} label="来源订单" value={order.sourceOrderNo} mono />
          <InfoRow icon={Clock} label="创建时间" value={formatDateTime(order.createdAt)} />
          <InfoRow icon={ShieldCheck} label="处理人" value={order.handlerName || '待分配'} />
          <InfoRow
            icon={AlertCircle}
            label="截止时间"
            value={formatDateTime(order.deadline)}
            valueClassName={getTimeRemaining(order.deadline).urgent ? 'text-red-600 font-semibold' : ''}
          />
        </div>
      </div>

      <div className="card p-4 border border-neutral-100">
        <h4 className="font-semibold text-sm text-neutral-800 mb-3 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-brand-orange" />
          问题描述
        </h4>
        <p className="text-sm text-neutral-700 leading-relaxed mb-3">{order.description}</p>
        {order.photos && order.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {order.photos.map((_, i) => (
              <div key={i} className="aspect-square rounded-lg border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center text-neutral-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4 border border-neutral-100">
        <h4 className="font-semibold text-sm text-neutral-800 mb-4 flex items-center gap-2">
          <Clock8 className="w-4 h-4 text-brand-orange" />
          处理时间轴
        </h4>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200" />
          {order.history.map((h, idx) => {
            const isLast = idx === order.history.length - 1;
            return (
              <div key={h.id} className={clsx('relative pb-5', isLast && 'pb-0')}>
                <div className={clsx(
                  'absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white',
                  isLast ? 'bg-brand-orange shadow-lg shadow-brand-orange/30' : 'bg-neutral-400'
                )}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="bg-neutral-50/80 rounded-lg p-3 ml-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-neutral-800">{h.action}</span>
                    <span className="text-xs text-neutral-500">{formatDateTime(h.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ color: getAvatarColor(h.operatorName) }}>
                      {getInitials(h.operatorName)}
                    </div>
                    <span>{h.operatorName}</span>
                    <span className="chip bg-white text-neutral-500 !text-[10px]">{h.operatorRole}</span>
                  </div>
                  {h.remark && (
                    <p className="text-xs text-neutral-600 bg-white/60 rounded px-2 py-1.5">
                      {h.remark}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-4 border border-neutral-100">
        <h4 className="font-semibold text-sm text-neutral-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          分类处理
        </h4>
        {order.type === 'RESCHEDULE' && <RescheduleForm order={order} />}
        {order.type === 'ADD_ITEM' && <AddItemForm order={order} />}
        {order.type === 'COMPLAINT' && <ComplaintForm order={order} />}
        {order.type === 'RETURN' && <ReturnForm order={order} />}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={2}
            placeholder="添加处理备注..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="input resize-none pr-12"
          />
          <button className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center hover:bg-brand-orange-dark transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            标记处理中
          </button>
          <button className="btn-primary">
            <CheckCircle2 className="w-4 h-4" />
            解决并关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  valueClassName,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <span className="text-xs text-neutral-500 shrink-0 w-16">{label}:</span>
      <span className={clsx('text-sm text-neutral-800 truncate', mono && 'font-mono', valueClassName)} title={value}>
        {value}
      </span>
    </div>
  );
}

function RescheduleForm({ order }: { order: AfterSalesOrder }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">原预约时间</label>
          <input
            type="text"
            value={order.originalAppointment || ''}
            readOnly
            className="input bg-neutral-50 text-neutral-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">新预约时间</label>
          <input
            type="text"
            defaultValue={order.newAppointment || ''}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">改约原因</label>
        <input
          type="text"
          defaultValue={order.rescheduleReason || ''}
          className="input"
          placeholder="请输入改约原因"
        />
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
        <span className="text-sm text-blue-700 font-medium">改约费用</span>
        <span className="text-lg font-bold text-blue-700">
          ¥{order.rescheduleFee || 0}
        </span>
      </div>
      <button className="w-full btn-primary">
        <Calendar className="w-4 h-4" />
        确认改约
      </button>
    </div>
  );
}

function AddItemForm({ order }: { order: AfterSalesOrder }) {
  const items = order.addedItems || [];
  return (
    <div className="space-y-4">
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="text-left px-3 py-2 font-medium">品类</th>
              <th className="text-left px-3 py-2 font-medium">名称</th>
              <th className="text-left px-3 py-2 font-medium w-16">数量</th>
              <th className="text-left px-3 py-2 font-medium w-20">单价</th>
              <th className="text-left px-3 py-2 font-medium w-20">小计</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t border-neutral-100">
                <td className="px-3 py-2 text-neutral-700">{item.category}</td>
                <td className="px-3 py-2 text-neutral-800">{item.name}</td>
                <td className="px-3 py-2 text-neutral-700">{item.quantity}</td>
                <td className="px-3 py-2 text-neutral-700">¥{item.unitPrice}</td>
                <td className="px-3 py-2 font-medium text-neutral-800">¥{item.quantity * item.unitPrice}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-neutral-400 text-sm">
                  暂无加项商品
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="w-full btn-secondary border-dashed border-neutral-300">
        <Plus className="w-4 h-4" />
        添加加项商品
      </button>
      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
        <span className="text-sm text-purple-700 font-medium flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          加项总费用
        </span>
        <span className="text-xl font-bold text-purple-700">
          {formatMoney(order.addItemTotalFee || 0)}
        </span>
      </div>
      <button className="w-full btn-primary">
        <CheckCircle2 className="w-4 h-4" />
        确认加项并更新订单
      </button>
    </div>
  );
}

function ComplaintForm({ order }: { order: AfterSalesOrder }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">投诉分类</label>
          <select defaultValue={order.complaintCategory} className="input">
            <option value="">请选择</option>
            {COMPLAINT_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">责任认定</label>
          <select defaultValue={order.responsibility} className="input">
            <option value="">待认定</option>
            {RESPONSIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">涉事师傅</label>
        <select defaultValue={order.involvedWorkerId} className="input">
          <option value="">请选择</option>
          {WORKER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">
          赔偿金额
          <span className="text-neutral-400 font-normal ml-1">(元)</span>
        </label>
        <input
          type="number"
          defaultValue={order.compensationAmount}
          className="input"
          placeholder="请输入赔偿金额"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">安抚方案</label>
        <textarea
          rows={3}
          defaultValue={order.appeasementPlan}
          placeholder="详细描述安抚方案..."
          className="input resize-none"
        />
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-100">
        <span className="text-sm text-rose-700 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          赔偿金额合计
        </span>
        <span className="text-xl font-bold text-rose-700">
          {formatMoney(order.compensationAmount || 0)}
        </span>
      </div>
      <button className="w-full btn-primary">
        <Send className="w-4 h-4" />
        提交处理方案
      </button>
    </div>
  );
}

function ReturnForm({ order }: { order: AfterSalesOrder }) {
  const secondLifeOptions = [
    { value: 'REFURBISH', label: '翻新后再售', icon: Sparkles, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'SCRAP', label: '报废处理', icon: Trash2, color: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'RELIST', label: '重新上架', icon: RotateCcw, color: 'bg-green-50 text-green-700 border-green-200' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">退货原因</label>
        <input
          type="text"
          defaultValue={order.returnReason}
          className="input"
          placeholder="请输入退货原因"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5">检测结果</label>
        <textarea
          rows={2}
          defaultValue={order.returnInspectionResult}
          placeholder="请填写仓内检测结果..."
          className="input resize-none"
        />
      </div>
      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
        <span className="text-sm text-amber-700 font-medium flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" />
          退款金额
        </span>
        <span className="text-xl font-bold text-amber-700">
          {formatMoney(order.returnRefundAmount || 0)}
        </span>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-2">二次生命处理</label>
        <div className="grid grid-cols-3 gap-2">
          {secondLifeOptions.map((opt) => {
            const IconComp = opt.icon;
            const selected = order.secondLifeStatus === opt.value;
            return (
              <button
                key={opt.value}
                className={clsx(
                  'p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all',
                  selected ? opt.color : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <IconComp className="w-5 h-5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button className="w-full btn-primary">
        <CheckCircle2 className="w-4 h-4" />
        确认退货并退款
      </button>
    </div>
  );
}
