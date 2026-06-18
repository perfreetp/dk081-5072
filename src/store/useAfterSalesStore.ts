import { create } from 'zustand';
import type {
  AfterSalesOrder,
  AfterSalesType,
  AfterSalesStatus,
  ComplaintLevel,
  ComplaintCategory,
  Responsibility,
} from '@/types/aftersales';
import mockAfterSales from '@/data/mockAfterSales';

interface AfterSalesFilters {
  type?: AfterSalesType;
  status?: AfterSalesStatus;
  complaintLevel?: ComplaintLevel;
  complaintCategory?: ComplaintCategory;
  responsibility?: Responsibility;
  handlerId?: string;
  involvedWorkerId?: string;
  keyword?: string;
  dateRange?: [string, string];
}

interface AfterSalesState {
  orders: AfterSalesOrder[];
  selectedIds: string[];
  filters: AfterSalesFilters;
  activeTab: AfterSalesType | 'ALL';
  isLoading: boolean;

  setActiveTab: (tab: AfterSalesType | 'ALL') => void;
  setFilters: (filters: Partial<AfterSalesFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addOrder: (order: Omit<AfterSalesOrder, 'id' | 'asNo' | 'createdAt' | 'history'>) => void;
  updateOrder: (id: string, data: Partial<AfterSalesOrder>) => void;
  deleteOrder: (id: string) => void;
  updateStatus: (id: string, status: AfterSalesStatus) => void;
  assignHandler: (id: string, handlerId: string, handlerName: string) => void;
  addHistory: (
    id: string,
    action: string,
    operatorName: string,
    operatorRole: string,
    remark?: string
  ) => void;
  setComplaintInfo: (
    id: string,
    info: {
      level?: ComplaintLevel;
      category?: ComplaintCategory;
      responsibility?: Responsibility;
      involvedWorkerId?: string;
      involvedWorkerName?: string;
      compensationAmount?: number;
      appeasementPlan?: string;
    }
  ) => void;
  setRescheduleInfo: (
    id: string,
    info: {
      originalAppointment?: string;
      newAppointment?: string;
      rescheduleReason?: string;
      rescheduleFee?: number;
    }
  ) => void;
  setAddItemInfo: (
    id: string,
    items: { category: string; name: string; quantity: number; unitPrice: number }[],
    totalFee: number
  ) => void;
  setReturnInfo: (
    id: string,
    info: {
      returnReason?: string;
      returnOrderId?: string;
      returnInspectionResult?: string;
      returnRefundAmount?: number;
      secondLifeStatus?: 'REFURBISH' | 'SCRAP' | 'RELIST';
    }
  ) => void;
  getOrderById: (id: string) => AfterSalesOrder | undefined;
  getOrdersBySourceOrderId: (sourceOrderId: string) => AfterSalesOrder[];
  getOrdersByHandler: (handlerId: string) => AfterSalesOrder[];
  getOrdersByWorker: (workerId: string) => AfterSalesOrder[];
  getFilteredOrders: () => AfterSalesOrder[];
  getOverdueOrders: () => AfterSalesOrder[];
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    closed: number;
    reschedule: number;
    addItem: number;
    complaint: number;
    return_: number;
    totalCompensation: number;
    totalRefund: number;
    totalAddItemFee: number;
    criticalComplaints: number;
  };
}

export const useAfterSalesStore = create<AfterSalesState>((set, get) => ({
  orders: mockAfterSales,
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
    return {
      selectedIds: allSelected
        ? s.selectedIds.filter((id) => !ids.includes(id))
        : [...new Set([...s.selectedIds, ...ids])],
    };
  }),
  clearSelection: () => set({ selectedIds: [] }),
  addOrder: (order) => set((s) => {
    const now = new Date();
    const id = `AS${String(s.orders.length + 1).padStart(3, '0')}`;
    const asNo = `AS${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(s.orders.length + 1).padStart(3, '0')}`;
    return {
      orders: [
        ...s.orders,
        {
          ...order,
          id,
          asNo,
          createdAt: now.toISOString(),
          history: [
            {
              id: `H${Date.now()}`,
              action: '创建工单',
              operatorName: '系统',
              operatorRole: 'SYSTEM',
              timestamp: now.toISOString(),
            },
          ],
        },
      ],
    };
  }),
  updateOrder: (id, data) => set((s) => ({
    orders: s.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
  })),
  deleteOrder: (id) => set((s) => ({
    orders: s.orders.filter((o) => o.id !== id),
  })),
  updateStatus: (id, status) => set((s) => ({
    orders: s.orders.map((o) =>
      o.id === id
        ? {
            ...o,
            status,
            history: [
              ...o.history,
              {
                id: `H${Date.now()}`,
                action: '状态更新',
                operatorName: '当前用户',
                operatorRole: 'USER',
                remark: `状态变更为：${status}`,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : o
    ),
  })),
  assignHandler: (id, handlerId, handlerName) => set((s) => ({
    orders: s.orders.map((o) =>
      o.id === id
        ? {
            ...o,
            handlerId,
            handlerName,
            history: [
              ...o.history,
              {
                id: `H${Date.now()}`,
                action: '分配处理人',
                operatorName: '系统',
                operatorRole: 'SYSTEM',
                remark: `分配给：${handlerName}`,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : o
    ),
  })),
  addHistory: (id, action, operatorName, operatorRole, remark) => set((s) => ({
    orders: s.orders.map((o) =>
      o.id === id
        ? {
            ...o,
            history: [
              ...o.history,
              {
                id: `H${Date.now()}`,
                action,
                operatorName,
                operatorRole,
                remark,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : o
    ),
  })),
  setComplaintInfo: (id, info) => set((s) => ({
    orders: s.orders.map((o) => (o.id === id ? { ...o, ...info } : o)),
  })),
  setRescheduleInfo: (id, info) => set((s) => ({
    orders: s.orders.map((o) => (o.id === id ? { ...o, ...info } : o)),
  })),
  setAddItemInfo: (id, items, totalFee) => set((s) => ({
    orders: s.orders.map((o) =>
      o.id === id ? { ...o, addedItems: items, addItemTotalFee: totalFee } : o
    ),
  })),
  setReturnInfo: (id, info) => set((s) => ({
    orders: s.orders.map((o) => (o.id === id ? { ...o, ...info } : o)),
  })),
  getOrderById: (id) => get().orders.find((o) => o.id === id),
  getOrdersBySourceOrderId: (sourceOrderId) =>
    get().orders.filter((o) => o.sourceOrderId === sourceOrderId),
  getOrdersByHandler: (handlerId) => get().orders.filter((o) => o.handlerId === handlerId),
  getOrdersByWorker: (workerId) =>
    get().orders.filter((o) => o.involvedWorkerId === workerId),
  getFilteredOrders: () => {
    const { orders, filters, activeTab } = get();
    return orders.filter((o) => {
      if (activeTab !== 'ALL' && o.type !== activeTab) return false;
      if (filters.type && o.type !== filters.type) return false;
      if (filters.status && o.status !== filters.status) return false;
      if (filters.complaintLevel && o.complaintLevel !== filters.complaintLevel) return false;
      if (filters.complaintCategory && o.complaintCategory !== filters.complaintCategory)
        return false;
      if (filters.responsibility && o.responsibility !== filters.responsibility) return false;
      if (filters.handlerId && o.handlerId !== filters.handlerId) return false;
      if (filters.involvedWorkerId && o.involvedWorkerId !== filters.involvedWorkerId)
        return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return (
          o.asNo.toLowerCase().includes(kw) ||
          o.sourceOrderNo.toLowerCase().includes(kw) ||
          o.customerName.includes(kw) ||
          o.customerPhone.includes(kw) ||
          o.description.includes(kw)
        );
      }
      return true;
    });
  },
  getOverdueOrders: () => {
    const { orders } = get();
    const now = new Date();
    return orders.filter((o) => {
      if (o.status === 'RESOLVED' || o.status === 'CLOSED') return false;
      return new Date(o.deadline) < now;
    });
  },
  getStats: () => {
    const { orders } = get();
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      processing: orders.filter((o) => o.status === 'PROCESSING').length,
      resolved: orders.filter((o) => o.status === 'RESOLVED').length,
      closed: orders.filter((o) => o.status === 'CLOSED').length,
      reschedule: orders.filter((o) => o.type === 'RESCHEDULE').length,
      addItem: orders.filter((o) => o.type === 'ADD_ITEM').length,
      complaint: orders.filter((o) => o.type === 'COMPLAINT').length,
      return_: orders.filter((o) => o.type === 'RETURN').length,
      totalCompensation: orders.reduce((sum, o) => sum + (o.compensationAmount || 0), 0),
      totalRefund: orders.reduce((sum, o) => sum + (o.returnRefundAmount || 0), 0),
      totalAddItemFee: orders.reduce((sum, o) => sum + (o.addItemTotalFee || 0), 0),
      criticalComplaints: orders.filter(
        (o) => o.type === 'COMPLAINT' && o.complaintLevel === 'CRITICAL'
      ).length,
    };
  },
}));
