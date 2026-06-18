import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Download,
  Calendar,
  Truck,
  Package,
  Users,
  Clock,
  MapPin,
  Eye,
  ArrowUpDown,
  Edit3,
  ChevronDown,
  PackagePlus,
  ArrowLeftRight,
  UserCheck,
  Check,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { useRouteStore, type Route } from '@/store/useRouteStore';
import { useOrderStore } from '@/store/useOrderStore';
import { VEHICLE_PRESETS } from '@/data/categoryPresets';
import { formatDate, getTimeSlotLabel, getInitials } from '@/utils/formatters';
import type { Order, TimeSlot, VehicleType } from '@/types/order';

type TimeSlotFilter = 'ALL' | TimeSlot;

interface LoadItem {
  id: string;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  orderNo: string;
  sequence: number;
  status: '待装' | '已装' | '待卸' | '已卸';
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  VAN: '厢式货车',
  TRUCK_SMALL: '小型卡车',
  TRUCK_MEDIUM: '中型卡车',
};

const VEHICLE_MAX_VOLUME: Record<VehicleType, number> = {
  VAN: VEHICLE_PRESETS.VAN.maxVolume,
  TRUCK_SMALL: VEHICLE_PRESETS.TRUCK_SMALL.maxVolume,
  TRUCK_MEDIUM: VEHICLE_PRESETS.TRUCK_MEDIUM.maxVolume,
};

const AREA_OPTIONS = [
  { label: '全部区域', value: '' },
  { label: '浦东新区', value: '浦东新区' },
  { label: '徐汇区', value: '徐汇区' },
  { label: '宝山区', value: '宝山区' },
  { label: '朝阳区', value: '朝阳区' },
  { label: '丰台区', value: '丰台区' },
  { label: '西城区', value: '西城区' },
  { label: '东城区', value: '东城区' },
];

const getStatusBadge = (status: Route['status']) => {
  const map: Record<Route['status'], { label: string; className: string; dot: string }> = {
    PLANNED: { label: '计划中', className: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    DEPARTED: { label: '进行中', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    IN_PROGRESS: { label: '进行中', className: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
    COMPLETED: { label: '已完成', className: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
    CANCELLED: { label: '已取消', className: 'bg-neutral-100 text-neutral-600', dot: 'bg-neutral-400' },
  };
  return map[status] || map.PLANNED;
};

const getTimeSlotBadge = (startTime: string) => {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return { label: '上午', className: 'bg-sky-100 text-sky-700' };
  if (hour < 17) return { label: '下午', className: 'bg-purple-100 text-purple-700' };
  return { label: '晚间', className: 'bg-indigo-100 text-indigo-700' };
};

function RouteCard({
  route,
  isSelected,
  onSelect,
}: {
  route: Route;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const maxVol = VEHICLE_MAX_VOLUME[route.vehicleType];
  const loadPct = Math.min(100, Math.round((route.totalVolume / maxVol) * 100));
  const statusBadge = getStatusBadge(route.status);
  const slotBadge = getTimeSlotBadge(route.startTime);
  const totalItems = route.stops.reduce((sum, s) => sum + s.itemsCount, 0);

  return (
    <div
      onClick={onSelect}
      className={`card p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-brand-orange/50 shadow-card-hover'
          : 'hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 text-lg font-bold text-neutral-900">
            <Truck className="w-5 h-5 text-brand-orange shrink-0" />
            <span className="truncate">{route.routeNo}</span>
          </div>
          <span className={`chip ${slotBadge.className}`}>{slotBadge.label}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
          <span className="px-2 py-0.5 rounded bg-neutral-100">{VEHICLE_LABELS[route.vehicleType]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-800 truncate">{route.vehiclePlate}</p>
            <p className="text-xs text-neutral-500 truncate">{route.driverName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex -space-x-2">
            {route.workerNames.slice(0, 3).map((name, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-brand-orange to-accent-amber flex items-center justify-center text-xs font-bold text-white"
                title={name}
              >
                {getInitials(name)}
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-800 truncate">师傅团队</p>
            <p className="text-xs text-neutral-500 truncate">{route.workerNames.length}人组</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-neutral-600">装载率</span>
          <span className="font-semibold text-neutral-800 tabular-nums">
            {route.totalVolume.toFixed(1)} / {maxVol} m³
            <span className="ml-2 text-brand-orange">{loadPct}%</span>
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`h-full rounded-full transition-all ${
              loadPct >= 90 ? 'bg-red-500' : loadPct >= 70 ? 'bg-brand-orange' : 'bg-green-500'
            }`}
            style={{ width: `${loadPct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {totalItems}件
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {route.stops.length}站
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-neutral-600 mb-4 pb-4 border-b border-neutral-100">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          <span className="font-medium">{route.startTime}</span>
          <ArrowLeftRight className="w-3 h-3 text-neutral-400" />
          <span className="font-medium">{route.endTime}</span>
        </span>
        <span className="text-neutral-300">|</span>
        <span>共 {route.stops.length} 个站点</span>
      </div>

      <div className="relative pl-5 mb-4">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200" />
        {route.stops.map((stop, idx) => {
          const isPickup = stop.stopType === 'PICKUP';
          const arrivalTime = stop.estimatedArrival.split(' ')[1] || stop.estimatedArrival;
          const isCurrent = route.currentStopIndex === idx;
          return (
            <div key={stop.id} className="relative pb-3 last:pb-0">
              <div
                className={`absolute -left-5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? 'bg-brand-orange border-brand-orange animate-pulse-slow'
                    : isPickup
                    ? 'bg-white border-blue-500'
                    : 'bg-white border-green-500'
                }`}
              >
                {isPickup ? (
                  <ArrowLeftRight className={`w-2.5 h-2.5 ${isCurrent ? 'text-white' : 'text-blue-500'}`} />
                ) : (
                  <MapPin className={`w-2.5 h-2.5 ${isCurrent ? 'text-white' : 'text-green-500'}`} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-medium ${isCurrent ? 'text-brand-orange' : 'text-neutral-700'}`}>
                    {isPickup ? '取件' : '送件'}
                  </span>
                  <span className="text-xs text-neutral-400">{arrivalTime}</span>
                  {isCurrent && (
                    <span className="chip bg-brand-orange/10 text-brand-orange-dark">当前站</span>
                  )}
                </div>
                <p className="text-sm text-neutral-800 truncate">
                  {stop.district} · {stop.customerName}
                </p>
                <p className="text-xs text-neutral-500 truncate">{stop.address}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={(e) => e.stopPropagation()}>
          <Eye className="w-3.5 h-3.5" />
          详情
        </button>
        <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={(e) => e.stopPropagation()}>
          <ArrowUpDown className="w-3.5 h-3.5" />
          调整
        </button>
        <button className="btn-ghost !py-1.5 !px-3 text-xs ml-auto" onClick={(e) => e.stopPropagation()}>
          <Edit3 className="w-3.5 h-3.5" />
          编辑
        </button>
      </div>
    </div>
  );
}

function PendingOrderItem({
  order,
  selectedRouteId,
  assignOrderToRoute,
  getRouteById,
}: {
  order: Order;
  selectedRouteId: string | null;
  assignOrderToRoute: (orderId: string, routeId: string, routeNo?: string) => { success: boolean; error?: string };
  getRouteById: (id: string) => Route | undefined;
}) {
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const slotLabel = getTimeSlotLabel(order.appointmentSlot);

  const handleAdd = () => {
    if (!selectedRouteId) {
      alert('请先从左侧选择一条线路');
      return;
    }
    const route = getRouteById(selectedRouteId);
    if (!route) return;

    const result = assignOrderToRoute(order.id, selectedRouteId, route.routeNo);
    if (result.success) {
      setAdded(true);
      setErrorMsg('');
      setTimeout(() => setAdded(false), 1000);
    } else if (result.error) {
      setErrorMsg(result.error);
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/50 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        order.priority === 'URGENT' ? 'bg-red-50' : order.priority === 'HIGH' ? 'bg-orange-50' : 'bg-blue-50'
      }`}>
        <Package className={`w-4 h-4 ${
          order.priority === 'URGENT' ? 'text-red-600' : order.priority === 'HIGH' ? 'text-orange-600' : 'text-blue-600'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm text-neutral-800 truncate">{order.orderNo}</span>
          <span className="chip bg-neutral-100 text-neutral-600 text-[10px]">{slotLabel.split(' ')[0]}</span>
        </div>
        <p className="text-xs text-neutral-500 truncate mb-1">{order.address.district} · {order.customer.name}</p>
        <p className="text-xs text-neutral-500 truncate">{order.address.street}{order.address.building}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-500">
          <span>{order.totalVolume.toFixed(1)}m³</span>
          <span>·</span>
          <span>{order.items.reduce((s, i) => s + i.quantity, 0)}件</span>
          <span>·</span>
          <span>{order.totalWeight}kg</span>
        </div>
        {order.assignedRouteNo && (
          <div className="mt-1.5">
            <span className="chip bg-green-50 text-green-700 text-[10px]">已排线路：{order.assignedRouteNo}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-1.5">
            <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded">{errorMsg}</span>
          </div>
        )}
      </div>
      <button
        onClick={handleAdd}
        disabled={added}
        className={`btn-primary !py-1.5 !px-3 text-xs shrink-0 ${added ? '!bg-green-600 !border-green-600' : errorMsg ? '!bg-red-500 !border-red-500' : ''}`}
      >
        {added ? (
          <>
            <Check className="w-3.5 h-3.5" />
            已加入
          </>
        ) : errorMsg ? (
          '无法加入'
        ) : (
          <>
            <PackagePlus className="w-3.5 h-3.5" />
            加入
          </>
        )}
      </button>
    </div>
  );
}

export default function Routing() {
  const [currentDate, setCurrentDate] = useState('2026-06-18');
  const [timeSlotFilter, setTimeSlotFilter] = useState<TimeSlotFilter>('ALL');
  const [areaFilter, setAreaFilter] = useState('');
  const [rightTab, setRightTab] = useState<'pending' | 'load'>('pending');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);

  const { routes, autoOptimizeRoutes, getRouteById } = useRouteStore();
  const { orders, assignOrderToRoute } = useOrderStore();

  const dateRoutes = useMemo(() => {
    return routes.filter((r) => r.date === currentDate).filter((r) => {
      if (areaFilter) {
        return r.stops.some((s) => s.district.includes(areaFilter));
      }
      return true;
    }).filter((r) => {
      if (timeSlotFilter === 'ALL') return true;
      const hour = parseInt(r.startTime.split(':')[0], 10);
      if (timeSlotFilter === 'MORNING') return hour < 12;
      if (timeSlotFilter === 'AFTERNOON') return hour >= 12 && hour < 17;
      return hour >= 17;
    });
  }, [routes, currentDate, areaFilter, timeSlotFilter]);

  const pendingOrders = useMemo(() => {
    const assignedOrderIds = new Set(routes.flatMap((r) => r.orderIds));
    return orders.filter(
      (o) =>
        !assignedOrderIds.has(o.id) &&
        ['PENDING', 'ASSIGNED'].includes(o.status) &&
        o.appointmentDate === currentDate
    );
  }, [orders, routes, currentDate]);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) || null,
    [routes, selectedRouteId]
  );

  const loadItems = useMemo<LoadItem[]>(() => {
    if (!selectedRoute) return [];
    const items: LoadItem[] = [];
    selectedRoute.stops.forEach((stop, stopIdx) => {
      const order = orders.find((o) => o.id === stop.orderId);
      if (order) {
        order.items.forEach((item, itemIdx) => {
          let status: LoadItem['status'] = '待装';
          if ((selectedRoute.currentStopIndex ?? -1) > stopIdx) {
            status = stop.stopType === 'PICKUP' ? '已装' : '已卸';
          } else if ((selectedRoute.currentStopIndex ?? -1) === stopIdx) {
            status = stop.stopType === 'PICKUP' ? '已装' : '待卸';
          }
          items.push({
            id: `${stop.id}-${item.id}`,
            name: item.name,
            quantity: item.quantity,
            volume: item.volume,
            weight: item.weight,
            orderNo: order.orderNo,
            sequence: stopIdx * 100 + itemIdx + 1,
            status,
          });
        });
      }
    });
    return items.sort((a, b) => a.sequence - b.sequence);
  }, [selectedRoute, orders]);

  const stats = useMemo(() => {
    const totalLoadRate =
      dateRoutes.length > 0
        ? Math.round(
            (dateRoutes.reduce((s, r) => s + r.totalVolume, 0) /
              dateRoutes.reduce((s, r) => s + VEHICLE_MAX_VOLUME[r.vehicleType], 0)) *
              100
          )
        : 0;
    const inTransit = dateRoutes.filter((r) =>
      ['DEPARTED', 'IN_PROGRESS'].includes(r.status)
    ).length;
    return {
      totalTrips: dateRoutes.length,
      avgLoadRate: totalLoadRate,
      inTransit,
      pendingCount: pendingOrders.length,
    };
  }, [dateRoutes, pendingOrders]);

  const shiftDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(formatDate(d));
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
  };

  const handleAutoOptimize = () => {
    const result = autoOptimizeRoutes(currentDate);
    if (result.totalOrders === 0) {
      alert('当前没有可拼车的订单');
      return;
    }
    let msg = `智能拼车完成：共收拢 ${result.totalOrders} 单，生成 ${result.newRoutesCount} 条新线路`;
    if (result.splitCount > 0) {
      msg += `，其中 ${result.splitCount} 趟因装载量超限拆分`;
    }
    alert(msg);
  };

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftDate(-1)}
              className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-orange/5 border border-brand-orange/20 min-w-[140px] justify-center">
              <Calendar className="w-4 h-4 text-brand-orange" />
              <span className="font-semibold text-brand-orange-dark">{formatDisplayDate(currentDate)}</span>
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center text-neutral-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-100">
            {(['ALL', 'MORNING', 'AFTERNOON', 'EVENING'] as TimeSlotFilter[]).map((slot) => (
              <button
                key={slot}
                onClick={() => setTimeSlotFilter(slot)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeSlotFilter === slot
                    ? 'bg-white text-brand-orange-dark shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                {slot === 'ALL' ? '全部' : slot === 'MORNING' ? '上午' : slot === 'AFTERNOON' ? '下午' : '晚间'}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-neutral-500" />
              {AREA_OPTIONS.find((o) => o.value === areaFilter)?.label || '全部区域'}
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${areaDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {areaDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-dropdown border border-neutral-100 py-1.5 z-50 animate-fade-in">
                {AREA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setAreaFilter(opt.value);
                      setAreaDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      areaFilter === opt.value
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

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-secondary" onClick={handleAutoOptimize}>
              <Sparkles className="w-4 h-4 text-brand-orange" />
              智能拼车优化
            </button>
            <button className="btn-primary">
              <Plus className="w-4 h-4" />
              新建线路
            </button>
            <button className="btn-secondary">
              <Download className="w-4 h-4" />
              导出装载清单
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="今日车次"
          value={stats.totalTrips}
          suffix="趟"
          icon={Truck}
          colorScheme="blue"
          trend={{ value: 12, label: '较昨日' }}
        />
        <StatCard
          title="平均装载率"
          value={stats.avgLoadRate}
          suffix="%"
          icon={Package}
          colorScheme="green"
          trend={{ value: 5, label: '较昨日' }}
        />
        <StatCard
          title="在途车辆"
          value={stats.inTransit}
          suffix="辆"
          icon={UserCheck}
          colorScheme="orange"
        />
        <StatCard
          title="待排单数"
          value={stats.pendingCount}
          suffix="单"
          icon={Clock}
          colorScheme="rose"
        />
      </div>

      <div className="grid grid-cols-100 gap-5" style={{ gridTemplateColumns: '55% 45%' }}>
        <div className="space-y-4 max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin pr-1">
          {dateRoutes.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-500">当前筛选条件下暂无线路</p>
            </div>
          ) : (
            dateRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={selectedRouteId === route.id}
                onSelect={() => {
                  setSelectedRouteId(route.id);
                  setRightTab('load');
                }}
              />
            ))
          )}
        </div>

        <div className="card overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 360px)' }}>
          <div className="flex items-center border-b border-neutral-100 px-2">
            <button
              onClick={() => setRightTab('pending')}
              className={`tab-btn ${rightTab === 'pending' ? 'tab-active' : 'tab-inactive'}`}
            >
              待排单池
              {pendingOrders.length > 0 && (
                <span className="ml-1.5 chip bg-neutral-100 text-neutral-600">{pendingOrders.length}</span>
              )}
            </button>
            <button
              onClick={() => setRightTab('load')}
              className={`tab-btn ${rightTab === 'load' ? 'tab-active' : 'tab-inactive'}`}
            >
              装载清单
              {selectedRoute && (
                <span className="ml-1.5 chip bg-neutral-100 text-neutral-600">{loadItems.length}</span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {rightTab === 'pending' ? (
              <div className="space-y-2.5">
                {pendingOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                    <p className="text-sm text-neutral-500">暂无待排订单</p>
                  </div>
                ) : (
                  pendingOrders.map((order) => (
                    <PendingOrderItem
                      key={order.id}
                      order={order}
                      selectedRouteId={selectedRouteId}
                      assignOrderToRoute={assignOrderToRoute}
                      getRouteById={getRouteById}
                    />
                  ))
                )}
              </div>
            ) : (
              <div>
                {!selectedRoute ? (
                  <div className="py-16 text-center">
                    <Package className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500 text-sm">请从左侧选择一条线路查看装载清单</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50">
                      <div>
                        <p className="font-semibold text-neutral-800 text-sm">{selectedRoute.routeNo}</p>
                        <p className="text-xs text-neutral-500">{selectedRoute.vehiclePlate} · {selectedRoute.driverName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-orange-dark tabular-nums">
                          {selectedRoute.totalVolume.toFixed(1)} / {VEHICLE_MAX_VOLUME[selectedRoute.vehicleType]} m³
                        </p>
                        <p className="text-xs text-neutral-500">{loadItems.length}件货品 · {selectedRoute.stops.length}站</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-neutral-100">
                      <table className="w-full text-sm">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th className="px-3 py-2.5 text-left font-medium text-neutral-600 text-xs">序号</th>
                            <th className="px-3 py-2.5 text-left font-medium text-neutral-600 text-xs">家具名称</th>
                            <th className="px-3 py-2.5 text-right font-medium text-neutral-600 text-xs">数量</th>
                            <th className="px-3 py-2.5 text-right font-medium text-neutral-600 text-xs">体积</th>
                            <th className="px-3 py-2.5 text-right font-medium text-neutral-600 text-xs">重量</th>
                            <th className="px-3 py-2.5 text-left font-medium text-neutral-600 text-xs">所属订单</th>
                            <th className="px-3 py-2.5 text-center font-medium text-neutral-600 text-xs">顺序</th>
                            <th className="px-3 py-2.5 text-center font-medium text-neutral-600 text-xs">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {loadItems.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-neutral-50/50">
                              <td className="px-3 py-2.5 text-neutral-500 tabular-nums">{idx + 1}</td>
                              <td className="px-3 py-2.5 text-neutral-800 max-w-[160px] truncate">{item.name}</td>
                              <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">{item.quantity}</td>
                              <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">{item.volume.toFixed(1)}m³</td>
                              <td className="px-3 py-2.5 text-right text-neutral-700 tabular-nums">{item.weight}kg</td>
                              <td className="px-3 py-2.5 text-neutral-500 text-xs">{item.orderNo}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="chip bg-neutral-100 text-neutral-600">#{Math.ceil(item.sequence / 100)}</span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`chip ${
                                  item.status === '已卸' ? 'bg-green-50 text-green-700' :
                                  item.status === '待卸' ? 'bg-purple-50 text-purple-700' :
                                  item.status === '已装' ? 'bg-blue-50 text-blue-700' :
                                  'bg-amber-50 text-amber-700'
                                }`}>{item.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
