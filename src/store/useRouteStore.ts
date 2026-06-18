import { create } from 'zustand';
import type { Priority, TimeSlot, VehicleType } from '@/types/order';
import mockRoutes from '@/data/mockRoutes';

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
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: mockRoutes as Route[],
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
      routes: [...s.routes, { ...route, id, routeNo, createdAt: now, updatedAt: now }],
    };
  }),
  updateRoute: (id, data) => set((s) => ({
    routes: s.routes.map((r) => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r),
  })),
  deleteRoute: (id) => set((s) => ({
    routes: s.routes.filter((r) => r.id !== id),
  })),
  updateRouteStatus: (id, status) => set((s) => ({
    routes: s.routes.map((r) => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r),
  })),
  addStop: (routeId, stop) => set((s) => ({
    routes: s.routes.map((r) => {
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
    }),
  })),
  updateStop: (routeId, stopId, data) => set((s) => ({
    routes: s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const newStops = r.stops.map((st) => st.id === stopId ? { ...st, ...data } : st);
      return {
        ...r,
        stops: newStops,
        totalVolume: newStops.reduce((sum, st) => sum + st.totalVolume, 0),
        totalWeight: newStops.reduce((sum, st) => sum + st.totalWeight, 0),
        updatedAt: new Date().toISOString(),
      };
    }),
  })),
  removeStop: (routeId, stopId) => set((s) => ({
    routes: s.routes.map((r) => {
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
    }),
  })),
  reorderStops: (routeId, stopIds) => set((s) => ({
    routes: s.routes.map((r) => {
      if (r.id !== routeId) return r;
      const stopMap = new Map(r.stops.map((st) => [st.id, st]));
      const newStops = stopIds
        .map((id, idx) => {
          const stop = stopMap.get(id);
          return stop ? { ...stop, sequence: idx + 1 } : null;
        })
        .filter((st): st is RouteStop => st !== null);
      return { ...r, stops: newStops, updatedAt: new Date().toISOString() };
    }),
  })),
  assignDriver: (routeId, driverId, driverName, driverPhone) => set((s) => ({
    routes: s.routes.map((r) => r.id === routeId
      ? { ...r, driverId, driverName, driverPhone, updatedAt: new Date().toISOString() }
      : r),
  })),
  assignWorkers: (routeId, workerIds, workerNames) => set((s) => ({
    routes: s.routes.map((r) => r.id === routeId
      ? { ...r, workerIds, workerNames, updatedAt: new Date().toISOString() }
      : r),
  })),
  setCurrentStop: (routeId, stopIndex) => set((s) => ({
    routes: s.routes.map((r) => r.id === routeId ? { ...r, currentStopIndex: stopIndex, updatedAt: new Date().toISOString() } : r),
  })),
  addRouteNote: (routeId, note) => set((s) => ({
    routes: s.routes.map((r) => r.id === routeId
      ? { ...r, routeNote: r.routeNote ? `${r.routeNote}\n${note}` : note, updatedAt: new Date().toISOString() }
      : r),
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
}));
