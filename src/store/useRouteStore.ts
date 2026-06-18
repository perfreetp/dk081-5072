import { create } from 'zustand';
import type { Order, Priority, TimeSlot, VehicleType } from '@/types/order';
import mockRoutes from '@/data/mockRoutes';
import { useOrderStore } from '@/store/useOrderStore';
import { VEHICLE_PRESETS } from '@/data/categoryPresets';
import { storage } from '@/utils/storage';

export type RouteStatus = 'PLANNED' | 'DEPARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface RouteStop {
  id: string;
  orderId: string;
  orderNo: string;
  customerName: string;
  address: string;
  district: string;
  floor: number;
  hasElevator: boolean;
  sequence: number;
  estimatedArrival: string;
  estimatedDeparture: string;
  stopType: 'PICKUP' | 'DELIVERY';
  itemsCount: number;
  totalVolume: number;
  totalWeight: number;
}

export interface Route {
  id: string;
  routeNo: string;
  date: string;
  startTime: string;
  endTime: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  workerIds: string[];
  workerNames: string[];
  stops: RouteStop[];
  orderIds: string[];
  totalOrders: number;
  totalVolume: number;
  totalWeight: number;
  estimatedDistance: number;
  estimatedDuration: number;
  startLocation: string;
  endLocation: string;
  priority: Priority;
  status: RouteStatus;
  currentStopIndex?: number;
  routeNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteFilters {
  status?: RouteStatus;
  date?: string;
  timeSlot?: TimeSlot;
  vehicleType?: VehicleType;
  priority?: Priority;
  district?: string;
  driverId?: string;
  keyword?: string;
}

interface RouteState {
  routes: Route[];
  selectedIds: string[];
  filters: RouteFilters;
  activeTab: RouteStatus | 'ALL';
  isLoading: boolean;

  setActiveTab: (tab: RouteStatus | 'ALL') => void;
  setFilters: (filters: Partial<RouteFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addRoute: (route: Omit<Route, 'id' | 'routeNo' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (id: string, data: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  updateRouteStatus: (id: string, status: RouteStatus) => void;
  addStop: (routeId: string, stop: Omit<RouteStop, 'id'>) => void;
  updateStop: (routeId: string, stopId: string, data: Partial<RouteStop>) => void;
  removeStop: (routeId: string, stopId: string) => void;
  reorderStops: (routeId: string, stopIds: string[]) => void;
  assignDriver: (routeId: string, driverId: string, driverName: string, driverPhone: string) => void;
  assignWorkers: (routeId: string, workerIds: string[], workerNames: string[]) => void;
  setCurrentStop: (routeId: string, stopIndex: number) => void;
  addRouteNote: (routeId: string, note: string) => void;
  getRouteById: (id: string) => Route | undefined;
  getRoutesByDate: (date: string) => Route[];
  getRoutesByDriver: (driverId: string) => Route[];
  getFilteredRoutes: () => Route[];
  getStats: () => { total: number; planned: number; inProgress: number; completed: number; totalOrders: number; totalDistance: number };

  validateAddOrderToRoute: (routeId: string, order: Order) => { success: boolean; error?: string };
  addOrderToRoute: (routeId: string, order: Order) => { success: boolean; error?: string };
  autoOptimizeRoutes: (date: string) => { totalOrders: number; newRoutesCount: number; splitCount: number };
}

const saveRoutes = (routes: Route[]): Route[] => {
  storage.set('routes', routes);
  return routes;
};

const selectVehicleType = (totalVolume: number): VehicleType => {
  if (totalVolume <= VEHICLE_PRESETS.VAN.maxVolume) return 'VAN';
  if (totalVolume <= VEHICLE_PRESETS.TRUCK_SMALL.maxVolume) return 'TRUCK_SMALL';
  return 'TRUCK_MEDIUM';
};

const buildStopFromOrder = (order: Order, sequence: number): RouteStop => {
  const addr = order.address;
  const fullAddress = `${addr.province}${addr.city}${addr.district}${addr.street}${addr.building}${addr.roomNo}`;
  const slotTimes: Record<TimeSlot, { start: string; end: string }> = {
    MORNING: { start: '09:00', end: '10:00' },
    AFTERNOON: { start: '14:00', end: '15:00' },
    EVENING: { start: '18:00', end: '19:00' },
  };
  const slot = slotTimes[order.appointmentSlot];
  return {
    id: `STOP${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    orderId: order.id,
    orderNo: order.orderNo,
    customerName: order.customer.name,
    address: fullAddress,
    district: addr.district,
    floor: addr.floor,
    hasElevator: addr.hasElevator,
    sequence,
    estimatedArrival: `${order.appointmentDate} ${slot.start}`,
    estimatedDeparture: `${order.appointmentDate} ${slot.end}`,
    stopType: order.type === 'RECYCLE' ? 'PICKUP' : 'DELIVERY',
    itemsCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
    totalVolume: order.totalVolume,
    totalWeight: order.totalWeight,
  };
};

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: storage.get('routes', mockRoutes as Route[]) as Route[],
  selectedIds: [],
  filters: {},
  activeTab: 'ALL',
  isLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (newFilters) => set((s) => ({ filters: { ...s.filters, ...newFilters } })),
  resetFilters: () => set({ filters: {} }),
  toggleSelect: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id)
      ? s.selectedIds.filter((x) => x !== id)
      : [...s.selectedIds, id],
  })),
  toggleSelectAll: (ids) => set((s) => {
    const allSelected = ids.every((id) => s.selectedIds.includes(id));
    return { selectedIds: allSelected ? s.selectedIds.filter((id) => !ids.includes(id)) : [...new Set([...s.selectedIds, ...ids])] };
  }),
  clearSelection: () => set({ selectedIds: [] }),
  addRoute: (route) => set((s) => {
    const now = new Date().toISOString();
    const id = `ROUTE${String(s.routes.length + 1).padStart(3, '0')}`;
    const routeNo = `RT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(s.routes.length + 1).padStart(3, '0')}`;
    return {
      routes: saveRoutes([...s.routes, { ...route, id, routeNo, createdAt: now, updatedAt: now }]),
    };
  }),
  updateRoute: (id, data) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)),
  })),
  deleteRoute: (id) => set((s) => ({
    routes: saveRoutes(s.routes.filter((r) => r.id !== id)),
  })),
  updateRouteStatus: (id, status) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)),
  })),
  addStop: (routeId, stop) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const newStop: RouteStop = { ...stop, id: `STOP${String(r.stops.length + 1).padStart(3, '0')}` };
      const newStops = [...r.stops, newStop].sort((a, b) => a.sequence - b.sequence);
      return {
        ...r,
        stops: newStops,
        orderIds: [...new Set([...r.orderIds, stop.orderId])],
        totalOrders: newStops.length,
        totalVolume: newStops.reduce((sum, st) => sum + st.totalVolume, 0),
        totalWeight: newStops.reduce((sum, st) => sum + st.totalWeight, 0),
        updatedAt: new Date().toISOString(),
      };
    })),
  })),
  updateStop: (routeId, stopId, data) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const newStops = r.stops.map((st) => st.id === stopId ? { ...st, ...data } : st);
      return {
        ...r,
        stops: newStops,
        totalVolume: newStops.reduce((sum, st) => sum + st.totalVolume, 0),
        totalWeight: newStops.reduce((sum, st) => sum + st.totalWeight, 0),
        updatedAt: new Date().toISOString(),
      };
    })),
  })),
  removeStop: (routeId, stopId) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const newStops = r.stops.filter((st) => st.id !== stopId);
      return {
        ...r,
        stops: newStops.map((st, idx) => ({ ...st, sequence: idx + 1 })),
        orderIds: newStops.map((st) => st.orderId),
        totalOrders: newStops.length,
        totalVolume: newStops.reduce((sum, st) => sum + st.totalVolume, 0),
        totalWeight: newStops.reduce((sum, st) => sum + st.totalWeight, 0),
        updatedAt: new Date().toISOString(),
      };
    })),
  })),
  reorderStops: (routeId, stopIds) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const stopMap = new Map(r.stops.map((st) => [st.id, st]));
      const newStops = stopIds
        .map((id, idx) => {
          const stop = stopMap.get(id);
          return stop ? { ...stop, sequence: idx + 1 } : null;
        })
        .filter((st): st is RouteStop => st !== null);
      return { ...r, stops: newStops, updatedAt: new Date().toISOString() };
    })),
  })),
  assignDriver: (routeId, driverId, driverName, driverPhone) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === routeId
      ? { ...r, driverId, driverName, driverPhone, updatedAt: new Date().toISOString() }
      : r)),
  })),
  assignWorkers: (routeId, workerIds, workerNames) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === routeId
      ? { ...r, workerIds, workerNames, updatedAt: new Date().toISOString() }
      : r)),
  })),
  setCurrentStop: (routeId, stopIndex) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === routeId ? { ...r, currentStopIndex: stopIndex, updatedAt: new Date().toISOString() } : r)),
  })),
  addRouteNote: (routeId, note) => set((s) => ({
    routes: saveRoutes(s.routes.map((r) => r.id === routeId
      ? { ...r, routeNote: r.routeNote ? `${r.routeNote}\n${note}` : note, updatedAt: new Date().toISOString() }
      : r)),
  })),
  getRouteById: (id) => get().routes.find((r) => r.id === id),
  getRoutesByDate: (date) => get().routes.filter((r) => r.date === date),
  getRoutesByDriver: (driverId) => get().routes.filter((r) => r.driverId === driverId),
  getFilteredRoutes: () => {
    const { routes, filters, activeTab } = get();
    return routes.filter((r) => {
      if (activeTab !== 'ALL' && r.status !== activeTab) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.date && r.date !== filters.date) return false;
      if (filters.vehicleType && r.vehicleType !== filters.vehicleType) return false;
      if (filters.priority && r.priority !== filters.priority) return false;
      if (filters.driverId && r.driverId !== filters.driverId) return false;
      if (filters.district && !r.stops.some((st) => st.district.includes(filters.district!))) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return r.routeNo.toLowerCase().includes(kw)
          || r.driverName.includes(kw)
          || r.vehiclePlate.toLowerCase().includes(kw)
          || r.stops.some((st) => st.customerName.includes(kw) || st.orderNo.toLowerCase().includes(kw));
      }
      return true;
    });
  },
  getStats: () => {
    const { routes } = get();
    return {
      total: routes.length,
      planned: routes.filter((r) => r.status === 'PLANNED').length,
      inProgress: routes.filter((r) => ['DEPARTED', 'IN_PROGRESS'].includes(r.status)).length,
      completed: routes.filter((r) => r.status === 'COMPLETED').length,
      totalOrders: routes.reduce((sum, r) => sum + r.totalOrders, 0),
      totalDistance: routes.reduce((sum, r) => sum + r.estimatedDistance, 0),
    };
  },

  validateAddOrderToRoute: (routeId, order) => {
    const route = get().routes.find((r) => r.id === routeId);
    if (!route) return { success: false, error: '线路不存在' };

    const routeSlot = route.stops[0]
      ? (() => {
          const h = parseInt(route.stops[0].estimatedArrival.split(' ')[1].split(':')[0], 10);
          if (h < 12) return 'MORNING';
          if (h < 17) return 'AFTERNOON';
          return 'EVENING';
        })()
      : null;

    if (routeSlot && routeSlot !== order.appointmentSlot) {
      return { success: false, error: '订单时段与当前车次时段不一致，请选择相同时段的车次' };
    }

    const maxVol = VEHICLE_PRESETS[route.vehicleType].maxVolume;
    if (route.totalVolume + order.totalVolume > maxVol) {
      return { success: false, error: `装载量超出车型上限（当前 ${route.totalVolume.toFixed(1)}m³ + 订单 ${order.totalVolume.toFixed(1)}m³ > ${maxVol}m³）` };
    }

    return { success: true };
  },

  addOrderToRoute: (routeId, order) => {
    const validation = get().validateAddOrderToRoute(routeId, order);
    if (!validation.success) return validation;

    const stop = buildStopFromOrder(order, 0);
    set((s) => {
      const updatedRoutes = s.routes.map((r) => {
        if (r.id !== routeId) return r;
        const newStop: RouteStop = { ...stop, id: `STOP${Date.now()}${Math.random().toString(36).slice(2, 6)}`, sequence: r.stops.length + 1 };
        const newStops = [...r.stops, newStop];
        const newOrderIds = [...new Set([...r.orderIds, order.id])];
        const newVolume = newStops.reduce((sum, st) => sum + st.totalVolume, 0);
        return {
          ...r,
          stops: newStops,
          orderIds: newOrderIds,
          totalOrders: newStops.length,
          totalVolume: newVolume,
          totalWeight: newStops.reduce((sum, st) => sum + st.totalWeight, 0),
          vehicleType: selectVehicleType(newVolume),
          updatedAt: new Date().toISOString(),
        };
      });
      return { routes: saveRoutes(updatedRoutes) };
    });

    return { success: true };
  },

  autoOptimizeRoutes: (date) => {
    const { routes } = get();
    const allOrders = useOrderStore.getState().orders;

    const plannedRoutesForDate = routes.filter((r) => r.date === date && r.status === 'PLANNED');
    const orderIdsInPlannedRoutes = new Set(plannedRoutesForDate.flatMap((r) => r.orderIds));

    const ordersToRoute = allOrders.filter(
      (o) =>
        o.appointmentDate === date &&
        (o.status === 'PENDING' || orderIdsInPlannedRoutes.has(o.id))
    );

    if (ordersToRoute.length === 0) {
      return { totalOrders: 0, newRoutesCount: 0, splitCount: 0 };
    }

    const orderIdsToReset = new Set(ordersToRoute.map((o) => o.id));
    useOrderStore.setState((s) => ({
      orders: s.orders.map((o) =>
        orderIdsToReset.has(o.id) && o.assignedRouteId
          ? { ...o, assignedRouteId: undefined, assignedRouteNo: undefined, status: 'PENDING' as const, updatedAt: new Date().toISOString() }
          : o
      ),
    }));

    const remainingRoutes = routes.filter((r) => !(r.date === date && r.status === 'PLANNED'));

    const groups = new Map<string, Order[]>();
    ordersToRoute.forEach((order) => {
      const key = `${order.address.district}__${order.appointmentSlot}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(order);
    });

    const slotTimes: Record<TimeSlot, { start: string; end: string }> = {
      MORNING: { start: '09:00', end: '12:00' },
      AFTERNOON: { start: '14:00', end: '17:00' },
      EVENING: { start: '18:00', end: '21:00' },
    };

    const newRoutes: Route[] = [...remainingRoutes];
    let newRoutesCount = 0;
    let splitCount = 0;
    let routeIndex = remainingRoutes.length + 1;

    const createRoute = (
      district: string,
      timeSlot: TimeSlot,
      ordersForRoute: Order[]
    ): Route => {
      const stops: RouteStop[] = ordersForRoute.map((order, idx) =>
        buildStopFromOrder(order, idx + 1)
      );
      const totalVolume = stops.reduce((sum, st) => sum + st.totalVolume, 0);
      const totalWeight = stops.reduce((sum, st) => sum + st.totalWeight, 0);
      const vehicleType = selectVehicleType(totalVolume);
      const times = slotTimes[timeSlot];
      const now = new Date().toISOString();
      const id = `ROUTE${String(routeIndex).padStart(3, '0')}`;
      const routeNo = `RT${date.replace(/-/g, '')}${String(routeIndex).padStart(3, '0')}`;
      routeIndex++;

      return {
        id,
        routeNo,
        date,
        startTime: `${date} ${times.start}`,
        endTime: `${date} ${times.end}`,
        vehicleType,
        vehiclePlate: '待分配',
        driverId: '',
        driverName: '待分配',
        driverPhone: '',
        workerIds: [],
        workerNames: [],
        stops,
        orderIds: ordersForRoute.map((o) => o.id),
        totalOrders: stops.length,
        totalVolume,
        totalWeight,
        estimatedDistance: 0,
        estimatedDuration: stops.length * 30,
        startLocation: '仓库',
        endLocation: '仓库',
        priority: 'NORMAL',
        status: 'PLANNED',
        createdAt: now,
        updatedAt: now,
      };
    };

    const batchOrdersByCapacity = (orders: Order[], timeSlot: TimeSlot, district: string): Route[] => {
      const result: Route[] = [];
      let currentBatch: Order[] = [];
      let currentVolume = 0;

      for (const order of orders) {
        const proposedVolume = currentVolume + order.totalVolume;
        const proposedVehicle = selectVehicleType(proposedVolume);
        const maxVol = VEHICLE_PRESETS[proposedVehicle].maxVolume;

        if (proposedVolume <= maxVol) {
          currentBatch.push(order);
          currentVolume = proposedVolume;
        } else {
          if (currentBatch.length > 0) {
            result.push(createRoute(district, timeSlot, currentBatch));
            if (result.length > 1) splitCount++;
          }
          currentBatch = [order];
          currentVolume = order.totalVolume;
        }
      }

      if (currentBatch.length > 0) {
        result.push(createRoute(district, timeSlot, currentBatch));
        if (result.length > 1) splitCount++;
      }

      return result;
    };

    groups.forEach((orders, key) => {
      const [district, slot] = key.split('__');
      const timeSlot = slot as TimeSlot;
      const createdRoutes = batchOrdersByCapacity(orders, timeSlot, district);
      newRoutes.push(...createdRoutes);
      newRoutesCount += createdRoutes.length;

      createdRoutes.forEach((route) => {
        route.orderIds.forEach((oid) => {
          useOrderStore.setState((s) => ({
            orders: s.orders.map((o) =>
              o.id === oid
                ? { ...o, assignedRouteId: route.id, assignedRouteNo: route.routeNo, status: 'ASSIGNED' as const, updatedAt: new Date().toISOString() }
                : o
            ),
          }));
        });
      });
    });

    set({ routes: saveRoutes(newRoutes) });
    return { totalOrders: ordersToRoute.length, newRoutesCount, splitCount };
  },
}));
