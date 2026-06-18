import type { OrderStatus, Priority, TimeSlot } from '@/types/order';
import type { WorkerStatus, WorkerType } from '@/types/worker';
import type { RouteStatus } from '@/types/route';
import type { WarehouseStatus } from '@/types/warehouse';
import type { AfterSalesStatus } from '@/types/aftersales';

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatMoney(amount: number, currency: string = '¥'): string {
  const formatted = amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

export function formatPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard;
  const start = idCard.slice(0, 4);
  const end = idCard.slice(-4);
  const maskLength = idCard.length - 8;
  const mask = '*'.repeat(maskLength);
  return `${start}${mask}${end}`;
}

type StatusType = 'order' | 'route' | 'warehouse' | 'aftersales' | 'worker';
type AllStatus = OrderStatus | RouteStatus | WarehouseStatus | AfterSalesStatus | WorkerStatus;

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '待分配',
  ASSIGNED: '已分配',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  RETURNING: '返程中',
};

const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
};

const WAREHOUSE_STATUS_LABELS: Record<WarehouseStatus, string> = {
  INBOUND: '入库中',
  CLEANING: '清洗中',
  REPAIRING: '维修中',
  PAINTING: '喷漆中',
  QC_CHECK: '质检中',
  FOR_SALE: '待售',
  SOLD: '已售出',
  RETURNED: '已退回',
  SCRAPPED: '已报废',
};

const AFTERSALES_STATUS_LABELS: Record<AfterSalesStatus, string> = {
  PENDING: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
  CLOSED: '已关闭',
};

const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  ON_DUTY: '在岗',
  OFF_DUTY: '离岗',
  ON_LEAVE: '休假',
  ON_TASK: '作业中',
};

export function getStatusLabel(status: AllStatus, type: StatusType): string {
  switch (type) {
    case 'order':
      return ORDER_STATUS_LABELS[status as OrderStatus] || status;
    case 'route':
      return ROUTE_STATUS_LABELS[status as RouteStatus] || status;
    case 'warehouse':
      return WAREHOUSE_STATUS_LABELS[status as WarehouseStatus] || status;
    case 'aftersales':
      return AFTERSALES_STATUS_LABELS[status as AfterSalesStatus] || status;
    case 'worker':
      return WORKER_STATUS_LABELS[status as WorkerStatus] || status;
    default:
      return status;
  }
}

type ColorScheme = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'amber' | 'cyan' | 'rose';

const ORDER_STATUS_COLORS: Record<OrderStatus, ColorScheme> = {
  PENDING: 'amber',
  ASSIGNED: 'blue',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'gray',
  RETURNING: 'cyan',
};

const ROUTE_STATUS_COLORS: Record<RouteStatus, ColorScheme> = {
  DRAFT: 'gray',
  PUBLISHED: 'blue',
  IN_PROGRESS: 'orange',
  COMPLETED: 'green',
};

const WAREHOUSE_STATUS_COLORS: Record<WarehouseStatus, ColorScheme> = {
  INBOUND: 'blue',
  CLEANING: 'cyan',
  REPAIRING: 'purple',
  PAINTING: 'amber',
  QC_CHECK: 'orange',
  FOR_SALE: 'green',
  SOLD: 'gray',
  RETURNED: 'rose',
  SCRAPPED: 'red',
};

const AFTERSALES_STATUS_COLORS: Record<AfterSalesStatus, ColorScheme> = {
  PENDING: 'amber',
  PROCESSING: 'orange',
  RESOLVED: 'green',
  CLOSED: 'gray',
};

const WORKER_STATUS_COLORS: Record<WorkerStatus, ColorScheme> = {
  ON_DUTY: 'green',
  OFF_DUTY: 'gray',
  ON_LEAVE: 'purple',
  ON_TASK: 'orange',
};

export function getStatusColor(status: AllStatus, type: StatusType): ColorScheme {
  switch (type) {
    case 'order':
      return ORDER_STATUS_COLORS[status as OrderStatus] || 'gray';
    case 'route':
      return ROUTE_STATUS_COLORS[status as RouteStatus] || 'gray';
    case 'warehouse':
      return WAREHOUSE_STATUS_COLORS[status as WarehouseStatus] || 'gray';
    case 'aftersales':
      return AFTERSALES_STATUS_COLORS[status as AfterSalesStatus] || 'gray';
    case 'worker':
      return WORKER_STATUS_COLORS[status as WorkerStatus] || 'gray';
    default:
      return 'gray';
  }
}

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: '普通',
  NORMAL: '常规',
  HIGH: '优先',
  URGENT: '加急',
};

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] || priority;
}

export function getPriorityColor(priority: Priority): ColorScheme {
  switch (priority) {
    case 'LOW':
      return 'gray';
    case 'NORMAL':
      return 'blue';
    case 'HIGH':
      return 'orange';
    case 'URGENT':
      return 'red';
    default:
      return 'gray';
  }
}

const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  INTERNAL: '内部师傅',
  OUTSOURCE: '外包师傅',
};

export function getWorkerTypeLabel(type: WorkerType): string {
  return WORKER_TYPE_LABELS[type] || type;
}

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  MORNING: '上午 08:00-12:00',
  AFTERNOON: '下午 13:00-17:00',
  EVENING: '晚间 18:00-21:00',
};

export function getTimeSlotLabel(slot: TimeSlot): string {
  return TIME_SLOT_LABELS[slot] || slot;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
}

export function getInitials(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  return trimmed.charAt(0);
}
