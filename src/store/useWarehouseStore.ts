import { create } from 'zustand';
import mockWarehouse from '@/data/mockWarehouse';
import { storage } from '@/utils/storage';

export type InventoryStatus = 'IN_STOCK' | 'INSPECTING' | 'RESTORING' | 'RESERVED' | 'SHIPPED' | 'SOLD' | 'DISCARDED' | 'RETURNING';
export type QualityGrade = 'A_PLUS' | 'A' | 'B' | 'C' | 'D';

export interface WarehouseLocation {
  zone: string;
  row: number;
  shelf: number;
  level: number;
  positionCode: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  category: string;
  name: string;
  brand: string;
  quantity: number;
  unit: string;
  volume: number;
  weight: number;
  qualityGrade: QualityGrade;
  status: InventoryStatus;
  location: WarehouseLocation;
  sourceOrderId?: string;
  sourceOrderNo?: string;
  sourceType: 'RECYCLE' | 'PURCHASE' | 'RETURN';
  purchasePrice?: number;
  sellingPrice?: number;
  reservedOrderId?: string;
  reservedCustomerName?: string;
  inspectionNote?: string;
  defectDescription?: string;
  photos?: string[];
  warehouseId: string;
  warehouseName: string;
  receivedAt: string;
  inspectedAt?: string;
  storedAt?: string;
  lastUpdatedAt: string;
  expectShipDate?: string;
}

interface InboundItemData {
  recycleOrderNo: string;
  category: string;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  defectRecord: string;
  missingParts: string[] | string;
  refurbishPlan: string;
  estimatedCost?: number;
}

interface WarehouseFilters {
  status?: InventoryStatus;
  qualityGrade?: QualityGrade;
  sourceType?: 'RECYCLE' | 'PURCHASE' | 'RETURN';
  warehouseId?: string;
  zone?: string;
  category?: string;
  keyword?: string;
  dateRange?: [string, string];
}

interface WarehouseState {
  items: InventoryItem[];
  selectedIds: string[];
  filters: WarehouseFilters;
  activeTab: InventoryStatus | 'ALL';
  isLoading: boolean;

  setActiveTab: (tab: InventoryStatus | 'ALL') => void;
  setFilters: (filters: Partial<WarehouseFilters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdatedAt'>) => void;
  updateItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  updateStatus: (id: string, status: InventoryStatus) => void;
  updateQualityGrade: (id: string, grade: QualityGrade) => void;
  updateLocation: (id: string, location: WarehouseLocation) => void;
  updatePricing: (id: string, purchasePrice?: number, sellingPrice?: number) => void;
  reserveItem: (id: string, orderId: string, customerName: string, expectShipDate: string) => void;
  cancelReservation: (id: string) => void;
  markAsInspected: (id: string, inspectionNote?: string) => void;
  markAsStored: (id: string) => void;
  markAsShipped: (id: string) => void;
  markAsSold: (id: string, soldPrice: number) => void;
  markAsDiscarded: (id: string, reason: string) => void;
  addDefectRecord: (id: string, defect: string) => void;
  getItemById: (id: string) => InventoryItem | undefined;
  getItemsByOrderId: (orderId: string) => InventoryItem[];
  getItemsByWarehouse: (warehouseId: string) => InventoryItem[];
  getItemsByZone: (warehouseId: string, zone: string) => InventoryItem[];
  getFilteredItems: () => InventoryItem[];
  getStats: () => {
    total: number;
    inStock: number;
    inspecting: number;
    restoring: number;
    reserved: number;
    shipped: number;
    sold: number;
    discarded: number;
    totalValue: number;
    totalVolume: number;
    totalWeight: number;
  };

  createInboundItem: (data: InboundItemData) => void;
  markOrderItemsShipped: (sourceOrderIdOrReservedId: string) => void;
}

const saveItems = (items: InventoryItem[]): InventoryItem[] => {
  storage.set('warehouseItems', items);
  return items;
};

const categoryCodeMap: Record<string, string> = {
  '三人沙发': 'SF',
  '茶几': 'CJ',
  '床': 'CH',
  '床垫': 'CD',
  '衣柜': 'YG',
  '餐桌': 'CZ',
  '椅子': 'YZ',
  '书桌': 'SZ',
  '书柜': 'SG',
  '电视柜': 'DS',
};

const generateSku = (category: string, idx: number): string => {
  const code = categoryCodeMap[category] || 'OT';
  return `SKU-${code}-${String(idx).padStart(4, '0')}`;
};

const generatePositionCode = (idx: number): WarehouseLocation => {
  const zones = ['A', 'B', 'C', 'D'];
  const zone = zones[idx % zones.length];
  const row = Math.floor(idx / zones.length) % 10 + 1;
  const shelf = Math.floor(idx / (zones.length * 10)) % 5 + 1;
  const level = Math.floor(idx / (zones.length * 10 * 5)) % 4 + 1;
  return {
    zone,
    row,
    shelf,
    level,
    positionCode: `${zone}-${String(row).padStart(2, '0')}-${String(shelf).padStart(2, '0')}-${level}`,
  };
};

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  items: storage.get('warehouseItems', mockWarehouse as InventoryItem[]) as InventoryItem[],
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
  addItem: (item) => set((s) => {
    const now = new Date().toISOString();
    const id = `INV${String(s.items.length + 1).padStart(3, '0')}`;
    return { items: saveItems([...s.items, { ...item, id, lastUpdatedAt: now }]) };
  }),
  updateItem: (id, data) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id ? { ...it, ...data, lastUpdatedAt: new Date().toISOString() } : it)),
  })),
  deleteItem: (id) => set((s) => ({
    items: saveItems(s.items.filter((it) => it.id !== id)),
  })),
  updateStatus: (id, status) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id ? { ...it, status, lastUpdatedAt: new Date().toISOString() } : it)),
  })),
  updateQualityGrade: (id, grade) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id ? { ...it, qualityGrade: grade, lastUpdatedAt: new Date().toISOString() } : it)),
  })),
  updateLocation: (id, location) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id ? { ...it, location, lastUpdatedAt: new Date().toISOString() } : it)),
  })),
  updatePricing: (id, purchasePrice, sellingPrice) => set((s) => ({
    items: saveItems(s.items.map((it) => {
      if (it.id !== id) return it;
      const updated: InventoryItem = { ...it, lastUpdatedAt: new Date().toISOString() };
      if (purchasePrice !== undefined) updated.purchasePrice = purchasePrice;
      if (sellingPrice !== undefined) updated.sellingPrice = sellingPrice;
      return updated;
    })),
  })),
  reserveItem: (id, orderId, customerName, expectShipDate) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'RESERVED', reservedOrderId: orderId, reservedCustomerName: customerName, expectShipDate, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  cancelReservation: (id) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'IN_STOCK', reservedOrderId: undefined, reservedCustomerName: undefined, expectShipDate: undefined, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  markAsInspected: (id, inspectionNote) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'INSPECTING', inspectedAt: new Date().toISOString(), inspectionNote, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  markAsStored: (id) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'IN_STOCK', storedAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  markAsShipped: (id) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id ? { ...it, status: 'SHIPPED', lastUpdatedAt: new Date().toISOString() } : it)),
  })),
  markAsSold: (id, soldPrice) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'SOLD', sellingPrice: soldPrice, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  markAsDiscarded: (id, reason) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, status: 'DISCARDED', inspectionNote: reason, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  addDefectRecord: (id, defect) => set((s) => ({
    items: saveItems(s.items.map((it) => it.id === id
      ? { ...it, defectDescription: it.defectDescription ? `${it.defectDescription}\n${defect}` : defect, lastUpdatedAt: new Date().toISOString() }
      : it)),
  })),
  getItemById: (id) => get().items.find((it) => it.id === id),
  getItemsByOrderId: (orderId) => get().items.filter((it) => it.sourceOrderId === orderId || it.reservedOrderId === orderId),
  getItemsByWarehouse: (warehouseId) => get().items.filter((it) => it.warehouseId === warehouseId),
  getItemsByZone: (warehouseId, zone) => get().items.filter((it) => it.warehouseId === warehouseId && it.location.zone === zone),
  getFilteredItems: () => {
    const { items, filters, activeTab } = get();
    return items.filter((it) => {
      if (activeTab !== 'ALL' && it.status !== activeTab) return false;
      if (filters.status && it.status !== filters.status) return false;
      if (filters.qualityGrade && it.qualityGrade !== filters.qualityGrade) return false;
      if (filters.sourceType && it.sourceType !== filters.sourceType) return false;
      if (filters.warehouseId && it.warehouseId !== filters.warehouseId) return false;
      if (filters.zone && it.location.zone !== filters.zone) return false;
      if (filters.category && !it.category.includes(filters.category)) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return it.sku.toLowerCase().includes(kw)
          || it.name.includes(kw)
          || it.brand.includes(kw)
          || it.category.includes(kw)
          || (it.sourceOrderNo && it.sourceOrderNo.toLowerCase().includes(kw))
          || (it.reservedCustomerName && it.reservedCustomerName.includes(kw));
      }
      return true;
    });
  },
  getStats: () => {
    const { items } = get();
    return {
      total: items.length,
      inStock: items.filter((it) => it.status === 'IN_STOCK').length,
      inspecting: items.filter((it) => it.status === 'INSPECTING').length,
      restoring: items.filter((it) => it.status === 'RESTORING').length,
      reserved: items.filter((it) => it.status === 'RESERVED').length,
      shipped: items.filter((it) => it.status === 'SHIPPED').length,
      sold: items.filter((it) => it.status === 'SOLD').length,
      discarded: items.filter((it) => it.status === 'DISCARDED').length,
      totalValue: items.reduce((sum, it) => sum + (it.sellingPrice || 0) * it.quantity, 0),
      totalVolume: items.reduce((sum, it) => sum + it.volume * it.quantity, 0),
      totalWeight: items.reduce((sum, it) => sum + it.weight * it.quantity, 0),
    };
  },

  createInboundItem: (data) => set((s) => {
    const now = new Date().toISOString();
    const nextIdx = s.items.length + 1;
    const id = `INV${String(nextIdx).padStart(3, '0')}`;
    const sku = generateSku(data.category, nextIdx);
    const location = generatePositionCode(nextIdx);
    const missingPartsStr = Array.isArray(data.missingParts)
      ? data.missingParts.join('、')
      : data.missingParts;
    const defectDesc = [data.defectRecord, missingPartsStr, data.refurbishPlan]
      .filter(Boolean)
      .join('\n');

    const newItem: InventoryItem = {
      id,
      sku,
      category: data.category,
      name: data.name,
      brand: '未知品牌',
      quantity: data.quantity,
      unit: '件',
      volume: data.volume,
      weight: data.weight,
      qualityGrade: 'B',
      status: 'INSPECTING',
      location,
      sourceOrderNo: data.recycleOrderNo,
      sourceType: 'RECYCLE',
      defectDescription: defectDesc || undefined,
      warehouseId: 'WH001',
      warehouseName: '主仓库',
      receivedAt: now,
      lastUpdatedAt: now,
    };

    return { items: saveItems([...s.items, newItem]) };
  }),

  markOrderItemsShipped: (sourceOrderIdOrReservedId) => set((s) => ({
    items: saveItems(s.items.map((it) => {
      const match = it.sourceOrderId === sourceOrderIdOrReservedId
        || it.reservedOrderId === sourceOrderIdOrReservedId;
      if (!match) return it;
      return { ...it, status: 'SHIPPED', lastUpdatedAt: new Date().toISOString() };
    })),
  })),
}));
