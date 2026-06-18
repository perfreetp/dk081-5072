import type { Order, VehicleType, TimeSlot } from './order';
import type { Worker } from './worker';

export type RouteStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Vehicle {
  id: string;
  plateNo: string;
  type: VehicleType;
  brand: string;
  model: string;
  maxVolume: number;
  maxWeight: number;
  driverName?: string;
  driverPhone?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

export interface RouteTask {
  taskId: string;
  sequence: number;
  order: Order;
  taskType: 'PICKUP' | 'DELIVERY' | 'RETURN';
  etaMinutes: number;
  distanceKm: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  actualArrival?: string;
  actualDeparture?: string;
}

export interface Route {
  id: string;
  routeNo: string;
  date: string;
  timeSlot: TimeSlot;
  status: RouteStatus;
  vehicle: Vehicle;
  workers: Worker[];
  area: string;
  tasks: RouteTask[];
  totalVolume: number;
  maxVolume: number;
  loadRate: number;
  totalWeight: number;
  totalDistance: number;
  estimatedDuration: number;
  departureTime?: string;
  returnTime?: string;
  createdAt: string;
  publishedAt?: string;
}
