import { useState } from 'react';
import {
  LayoutList,
  Clock,
  Loader,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  Truck,
  Eye,
  Send,
  Tag,
  Plus,
  Layers,
  Download,
  Sofa,
  Armchair,
  BedDouble,
  BedSingle,
  DoorOpen,
  UtensilsCrossed,
  Tv,
  BookOpen,
  Coffee,
  Square,
  Archive,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import type { Order, OrderItem, OrderStatus, Priority, TimeSlot } from '@/types/order';
import StatCard from '@/components/common/StatCard';
import FilterBar from '@/components/common/FilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityTag from '@/components/common/PriorityTag';
import {
  formatPhone,
  getInitials,
  getTimeSlotLabel,
} from '@/utils/formatters';
import { VEHICLE_PRESETS } from '@/data/categoryPresets';

const CATEGORY_ICON_MAP: Record<string, typeof Sofa> = {
  '三人沙发': Sofa,
  '双人沙发': Sofa,
  '单人沙发': Armchair,
  '双人床': BedDouble,
  '单人床': BedSingle,
  '大衣柜': DoorOpen,
  '衣柜': DoorOpen,
  '餐桌+椅': UtensilsCrossed,
  '电视柜': Tv,
  '书柜': BookOpen,
  '茶几': Coffee,
  '床垫': Square,
  '鞋柜': Archive,
  '老板桌': DoorOpen,
  '办公椅': Armchair,
  '书桌': BookOpen,
  '床头柜': Square,
};

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: '待分配', value: 'PENDING' },
  { label: '已分配', value: 'ASSIGNED' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '返程中', value: 'RETURNING' },
];

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: '普通', value: 'LOW' },
  { label: '常规', value: 'NORMAL' },
  { label: '优先', value: 'HIGH' },
  { label: '加急', value: 'URGENT' },
];

const TIME_SLOT_OPTIONS: { label: string; value: TimeSlot }[] = [
  { label: '上午', value: 'MORNING' },
  { label: '下午', value: 'AFTERNOON' },
  { label: '晚间', value: 'EVENING' },
];

const DISTRICT_OPTIONS = [
  { label: '浦东新区', value: '浦东新区' },
  { label: '徐汇区', value: '徐汇区' },
  { label: '静安区', value: '静安区' },
  { label: '长宁区', value: '长宁区' },
  { label: '普陀区', value: '普陀区' },
  { label: '杨浦区', value: '杨浦区' },
  { label: '闵行区', value: '闵行区' },
  { label: '宝山区', value: '宝山区' },
  { label: '朝阳区', value: '朝阳区' },
  { label: '海淀区', value: '海淀区' },
  { label: '西城区', value: '西城区' },
  { label: '东城区', value: '东城区' },
  { label: '丰台区', value: '丰台区' },
  { label: '通州区', value: '通州区' },
  { label: '石景山区', value: '石景山区' },
];

function CategoryIcon({ category }: { category: string }) {
  const Icon = CATEGORY_ICON_MAP[category] || Archive;
  return <Icon className="w-4 h-4 shrink-0 text-neutral-500" />;
}

function OrderCard({ order }: { order: Order }) {
  const [hovered, setHovered] = useState(false);

  const handleCardClick = () => {
    alert(`跳转到订单详情页：/orders/${order.id}`);
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`查看订单详情：${order.orderNo}`);
  };

  const handleQuickAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`快速派单：${order.orderNo}`);
  };

  const handleMarkDefect = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert(`标记瑕疵：${order.orderNo}`);
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-brand-orange/20 text-brand-orange-dark',
      'bg-brand-green/20 text-brand-green-light',
      'bg-accent-cyan/20 text-cyan-700',
      'bg-accent-rose/20 text-accent-rose',
      'bg-purple-100 text-purple-700',
    ];
    const idx = order.customer.name.charCodeAt(0) % colors.length;
    return colors[idx];
  };

  const vehicleInfo = VEHICLE_PRESETS[order.vehicleRequire];

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card p-5 cursor-pointer hover:shadow-card-hover transition-all duration-200 relative group"
    >
      {hovered && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 animate-fade-in">
          <button
            onClick={handleViewDetail}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-xs font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-colors shadow-sm"
            title="查看详情"
          >
            <Eye className="w-3.5 h-3.5" />
            详情
          </button>
          <button
            onClick={handleQuickAssign}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange-dark text-xs font-medium hover:bg-brand-orange/20 transition-colors shadow-sm"
            title="快速派单"
          >
            <Send className="w-3.5 h-3.5" />
            派单
          </button>
          <button
            onClick={handleMarkDefect}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors shadow-sm"
            title="标记瑕疵"
          >
            <Tag className="w-3.5 h-3.5" />
            瑕疵
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-4 pr-28">
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 font-medium mb-1.5">订单号</p>
          <p className="text-sm font-bold text-neutral-900 tabular-nums truncate">{order.orderNo}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PriorityTag priority={order.priority} size="sm" />
          <StatusBadge status={order.status} type="order" size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-neutral-100">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor()}`}>
          {getInitials(order.customer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral-900 truncate">{order.customer.name}</p>
          <p className="text-xs text-neutral-500 tabular-nums">{formatPhone(order.customer.phone)}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-700 mb-0.5">{order.address.district}</p>
          <p className="text-xs text-neutral-500 truncate">
            {order.address.street} {order.address.building} {order.address.roomNo}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4 p-3 bg-neutral-50 rounded-lg">
        {order.items.slice(0, 3).map((item: OrderItem) => (
          <div key={item.id} className="flex items-center gap-2">
            <CategoryIcon category={item.category} />
            <span className="text-xs text-neutral-700 font-medium truncate flex-1">{item.name}</span>
            <span className="text-xs text-neutral-500 tabular-nums shrink-0">x{item.quantity}</span>
            <span className="text-xs text-brand-orange-dark font-medium tabular-nums shrink-0 w-12 text-right">{item.volume}m³</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-neutral-400 text-center pt-1 border-t border-neutral-100">
            还有 {order.items.length - 3} 件家具...
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400 leading-tight">预约时间</p>
            <p className="text-xs text-neutral-700 font-medium truncate leading-tight">
              {order.appointmentDate.slice(5)} {getTimeSlotLabel(order.appointmentSlot).slice(0, 2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400 leading-tight">需要人数</p>
            <p className="text-xs text-neutral-700 font-medium truncate leading-tight">{order.workerCount} 人</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <Truck className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400 leading-tight">车型要求</p>
            <p className="text-xs text-neutral-700 font-medium truncate leading-tight">{vehicleInfo.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const {
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
    getFilteredOrders,
    getStats,
  } = useOrderStore();

  const stats = getStats();
  const filteredOrders = getFilteredOrders();

  const filterConfigs = [
    {
      key: 'status',
      label: '状态',
      options: STATUS_OPTIONS,
      placeholder: '全部状态',
    },
    {
      key: 'priority',
      label: '优先级',
      options: PRIORITY_OPTIONS,
      placeholder: '全部优先级',
    },
    {
      key: 'timeSlot',
      label: '时段',
      options: TIME_SLOT_OPTIONS,
      placeholder: '全部时段',
    },
    {
      key: 'district',
      label: '区域',
      options: DISTRICT_OPTIONS,
      placeholder: '全部区域',
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value } as typeof filters);
  };

  const handleSearchChange = (value: string) => {
    setFilters({ keyword: value });
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="订单总数"
          value={stats.total}
          icon={LayoutList}
          colorScheme="blue"
          suffix="单"
        />
        <StatCard
          title="待派单"
          value={stats.pending}
          icon={Clock}
          colorScheme="amber"
          suffix="单"
        />
        <StatCard
          title="进行中"
          value={stats.inProgress}
          icon={Loader}
          colorScheme="orange"
          suffix="单"
        />
        <StatCard
          title="已完成"
          value={stats.completed}
          icon={CheckCircle}
          colorScheme="green"
          suffix="单"
        />
        <StatCard
          title="加急单"
          value={stats.urgent}
          icon={AlertTriangle}
          colorScheme="rose"
          suffix="单"
        />
      </div>

      <div className="card">
        <div className="flex items-center gap-1 px-5 border-b border-neutral-100">
          <button
            onClick={() => setActiveTab('RECYCLE')}
            className={`tab-btn ${activeTab === 'RECYCLE' ? 'tab-active' : 'tab-inactive'}`}
          >
            回收单
          </button>
          <button
            onClick={() => setActiveTab('SELL')}
            className={`tab-btn ${activeTab === 'SELL' ? 'tab-active' : 'tab-inactive'}`}
          >
            售出单
          </button>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="搜索订单号、客户姓名、电话、家具..."
        searchValue={filters.keyword || ''}
        onSearchChange={handleSearchChange}
        filters={filterConfigs}
        filterValues={{
          status: filters.status || '',
          priority: filters.priority || '',
          timeSlot: filters.timeSlot || '',
          district: filters.district || '',
        }}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showAdvancedToggle={true}
        extraActions={
          <div className="flex items-center gap-2">
            <button className="btn-secondary">
              <Plus className="w-4 h-4" />
              新建订单
            </button>
            <button className="btn-secondary">
              <Layers className="w-4 h-4" />
              批量派单
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
        }
      />

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="card p-16 flex flex-col items-center justify-center">
          <LayoutList className="w-16 h-16 text-neutral-300 mb-4" />
          <p className="text-lg font-medium text-neutral-600 mb-2">暂无订单</p>
          <p className="text-sm text-neutral-400">当前筛选条件下没有找到订单</p>
        </div>
      )}
    </div>
  );
}
