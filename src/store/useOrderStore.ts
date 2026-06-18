import { create } from 'zustand';
import type { Order, OrderStatus, OrderType, Priority, TimeSlot } from '@/types/order';
import type { Worker } from '@/types/worker';
import mockOrders from '@/data/mockOrders';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useRouteStore } from '@/store/useRouteStore';

interface OrderFilters {
  type?: OrderType;
  status?: OrderStatus;
  priority?: Priority;
  timeSlot?: TimeSlot;
  district?: string;
  keyword?: string;
  dateRange?: [string, string];
}

interface OrderState {
  orders: Order[];
  selectedIds: string[];
  filters: OrderFilters;
  activeTab: OrderType;
  isLoading: boolean;
  
  setActiveTab: (tab: OrderType) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignWorkers: (id: string, workerIds: string[]) => void;
  assignRoute: (id: string, routeId: string) => void;
  updatePriority: (id: string, priority: Priority) => void;
  addRemark: (id: string, remark: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getFilteredOrders: () => Order[];
  getStats: () => { total: number; pending: number; inProgress: number; completed: number; urgent: number };
  assignOrderToRoute: (orderId: string, routeId: string, routeNo?: string) => { success: boolean; error?: string };
  quickAssignWorkers: (orderId: string, workerIds: string[], workerNames: string[]) => void;
  autoReassignTimeoutOrders: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: mockOrders,
  selectedIds: [],
  filters: {},
  activeTab: 'RECYCLE',
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
  updateOrderStatus: (id, status) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o),
  })),
  assignWorkers: (id, workerIds) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? { ...o, assignedWorkerIds: workerIds, updatedAt: new Date().toISOString() } : o),
  })),
  assignRoute: (id, routeId) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? { ...o, assignedRouteId: routeId, updatedAt: new Date().toISOString() } : o),
  })),
  updatePriority: (id, priority) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? { ...o, priority, updatedAt: new Date().toISOString() } : o),
  })),
  addRemark: (id, remark) => set((s) => ({
    orders: s.orders.map((o) => o.id === id ? { ...o, remarks: o.remarks ? `${o.remarks}\n${remark}` : remark, updatedAt: new Date().toISOString() } : o),
  })),
  getOrderById: (id) => get().orders.find((o) => o.id === id),
  getFilteredOrders: () => {
    const { orders, filters, activeTab } = get();
    return orders.filter((o) => {
      if (o.type !== activeTab) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (filters.priority && o.priority !== filters.priority) return false;
      if (filters.timeSlot && o.appointmentSlot !== filters.timeSlot) return false;
      if (filters.district && !o.address.district.includes(filters.district)) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return o.orderNo.toLowerCase().includes(kw)
          || o.customer.name.includes(kw)
          || o.customer.phone.includes(kw)
          || o.items.some((it) => it.category.includes(kw) || it.name.includes(kw));
      }
      return true;
    });
  },
  getStats: () => {
    const { orders, activeTab } = get();
    const filtered = orders.filter((o) => o.type === activeTab);
    return {
      total: filtered.length,
      pending: filtered.filter((o) => o.status === 'PENDING').length,
      inProgress: filtered.filter((o) => ['ASSIGNED', 'IN_PROGRESS'].includes(o.status)).length,
      completed: filtered.filter((o) => o.status === 'COMPLETED').length,
      urgent: filtered.filter((o) => o.priority === 'URGENT' && o.status !== 'COMPLETED').length,
    };
  },

  assignOrderToRoute: (orderId, routeId, routeNo) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: '订单不存在' };

    const routeStore = useRouteStore.getState();

    if (order.assignedRouteId === routeId) {
      return { success: true };
    }

    const validation = routeStore.validateAddOrderToRoute(routeId, order);
    if (!validation.success) {
      return validation;
    }

    if (order.assignedRouteId) {
      const oldRoute = routeStore.getRouteById(order.assignedRouteId);
      if (oldRoute) {
        const stopToRemove = oldRoute.stops.find((st) => st.orderId === orderId);
        if (stopToRemove) {
          routeStore.removeStop(order.assignedRouteId, stopToRemove.id);
        }
      }
    }

    const addResult = routeStore.addOrderToRoute(routeId, order);
    if (!addResult.success) {
      return addResult;
    }

    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId
          ? { ...o, assignedRouteId: routeId, assignedRouteNo: routeNo, status: 'ASSIGNED' as const, updatedAt: new Date().toISOString() }
          : o
      ),
    }));

    return { success: true };
  },

  quickAssignWorkers: (orderId, workerIds, workerNames) => set((s) => ({
    orders: s.orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            assignedWorkerIds: workerIds,
            assignedWorkerNames: workerNames,
            status: 'ASSIGNED',
            updatedAt: new Date().toISOString(),
          }
        : o
    ),
  })),

  autoReassignTimeoutOrders: () => {
    const { orders } = get();
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    const timeoutOrders = orders.filter((o) => {
      if (o.status !== 'PENDING') return false;
      if (o.timeoutReassigned) return false;
      const createdAt = new Date(o.createdAt).getTime();
      return now - createdAt > THIRTY_MINUTES;
    });

    if (timeoutOrders.length === 0) return 0;

    const availableWorkers: Worker[] = useWorkerStore.getState().getAvailableWorkers();
    let workerIndex = 0;

    const updatedOrders = orders.map((o) => {
      if (!timeoutOrders.find((t) => t.id === o.id)) return o;
      const worker = availableWorkers[workerIndex % Math.max(availableWorkers.length, 1)];
      workerIndex++;
      return {
        ...o,
        priority: 'HIGH' as Priority,
        status: 'ASSIGNED' as OrderStatus,
        assignedWorkerIds: worker ? [worker.id] : o.assignedWorkerIds,
        assignedWorkerNames: worker ? [worker.name] : o.assignedWorkerNames,
        timeoutReassigned: true,
        updatedAt: new Date().toISOString(),
      };
    });

    set({ orders: updatedOrders });
    return timeoutOrders.length;
  },
}));
