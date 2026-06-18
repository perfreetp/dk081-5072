import type { CategoryPreset, VehicleType } from '@/types/order';

export const VEHICLE_PRESETS: Record<VehicleType, { name: string; maxVolume: number; maxWeight: number; icon: string }> = {
  VAN: { name: '面包车', maxVolume: 5, maxWeight: 800, icon: '🚐' },
  TRUCK_SMALL: { name: '4.2米厢货', maxVolume: 12, maxWeight: 2000, icon: '🚛' },
  TRUCK_MEDIUM: { name: '6.8米厢货', maxVolume: 30, maxWeight: 5000, icon: '🚚' },
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { category: '三人沙发', icon: 'Sofa', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 1.8, disassemblyLevel: 3, keywords: ['沙发', 'sofa'] },
  { category: '双人沙发', icon: 'Sofa', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 1.2, disassemblyLevel: 2, keywords: ['双人沙发'] },
  { category: '单人沙发', icon: 'Armchair', defaultWorkers: 1, defaultVehicle: 'VAN', defaultVolume: 0.6, disassemblyLevel: 1, keywords: ['单人沙发', '扶手椅'] },
  { category: '双人床', icon: 'BedDouble', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 1.2, disassemblyLevel: 3, keywords: ['床', '床架'] },
  { category: '单人床', icon: 'BedSingle', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 0.8, disassemblyLevel: 2, keywords: ['单人床'] },
  { category: '大衣柜', icon: 'DoorOpen', defaultWorkers: 3, defaultVehicle: 'TRUCK_SMALL', defaultVolume: 2.5, disassemblyLevel: 5, keywords: ['衣柜', '衣橱'] },
  { category: '餐桌+椅', icon: 'UtensilsCrossed', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 1.0, disassemblyLevel: 2, keywords: ['餐桌', '饭桌'] },
  { category: '电视柜', icon: 'Tv', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 0.8, disassemblyLevel: 2, keywords: ['电视柜'] },
  { category: '书柜', icon: 'BookOpen', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 1.5, disassemblyLevel: 4, keywords: ['书柜', '书架'] },
  { category: '茶几', icon: 'Coffee', defaultWorkers: 1, defaultVehicle: 'VAN', defaultVolume: 0.3, disassemblyLevel: 1, keywords: ['茶几', '边几'] },
  { category: '床垫', icon: 'Square', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 0.9, disassemblyLevel: 1, keywords: ['床垫', '席梦思'] },
  { category: '鞋柜', icon: 'Archive', defaultWorkers: 2, defaultVehicle: 'VAN', defaultVolume: 0.7, disassemblyLevel: 2, keywords: ['鞋柜', '鞋架'] },
];

export const TIME_SLOT_OPTIONS = [
  { value: 'MORNING', label: '上午 (09:00-12:00)' },
  { value: 'AFTERNOON', label: '下午 (13:00-18:00)' },
  { value: 'EVENING', label: '晚间 (18:00-21:00)' },
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: '普通', color: 'bg-neutral-100 text-neutral-600' },
  { value: 'NORMAL', label: '常规', color: 'bg-accent-cyan/10 text-accent-cyan' },
  { value: 'HIGH', label: '优先', color: 'bg-accent-amber/15 text-amber-700' },
  { value: 'URGENT', label: '加急', color: 'bg-accent-rose/10 text-accent-rose' },
];

export default {
  VEHICLE_PRESETS,
  CATEGORY_PRESETS,
  TIME_SLOT_OPTIONS,
  PRIORITY_OPTIONS,
};
