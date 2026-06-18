import { create } from 'zustand';
import type { Order, OrderStatus, OrderType, Priority, TimeSlot } from '@/types/order';
import mockOrders from '@/data/mockOrders';

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
}));
