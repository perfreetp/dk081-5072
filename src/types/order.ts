export type OrderType = 'RECYCLE' | 'SELL';
export type OrderStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RETURNING';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type VehicleType = 'VAN' | 'TRUCK_SMALL' | 'TRUCK_MEDIUM';
export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Address {
  id: string;
  province: string;
  city: string;
  district: string;
  street: string;
  building: string;
  roomNo: string;
  floor: number;
  hasElevator: boolean;
  latitude?: number;
  longitude?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  category: string;
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  disassemblyLevel: 1 | 2 | 3 | 4 | 5;
  photos?: string[];
  defectNotes?: string;
  missingParts?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  type: OrderType;
  status: OrderStatus;
  priority: Priority;
  customer: Customer;
  address: Address;
  items: OrderItem[];
  appointmentDate: string;
  appointmentSlot: TimeSlot;
  appointmentTime: string;
  vehicleRequire: VehicleType;
  workerCount: number;
  totalVolume: number;
  totalWeight: number;
  estimatedFee: number;
  actualFee?: number;
  preInspection?: string;
  riskNote?: string;
  buildingRuleId?: string;
  assignedRouteId?: string;
  assignedWorkerIds?: string[];
  assignedWorkerNames?: string[];
  assignedRouteNo?: string;
  timeoutReassigned?: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CategoryPreset {
  category: string;
  icon: string;
  defaultWorkers: number;
  defaultVehicle: VehicleType;
  defaultVolume: number;
  disassemblyLevel: 1 | 2 | 3 | 4 | 5;
  keywords: string[];
}
