import type { OrderStatus } from '@/types/order';
import type { RouteStatus } from '@/types/route';
import type { WarehouseStatus } from '@/types/warehouse';
import type { AfterSalesStatus } from '@/types/aftersales';
import type { WorkerStatus } from '@/types/worker';
import { getStatusLabel, getStatusColor } from '@/utils/formatters';

type StatusType = 'order' | 'route' | 'warehouse' | 'aftersales' | 'worker';
type AllStatus = OrderStatus | RouteStatus | WarehouseStatus | AfterSalesStatus | WorkerStatus;

type ColorScheme = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'amber' | 'cyan' | 'rose';

interface StatusBadgeProps {
  status: AllStatus;
  type: StatusType;
  size?: 'sm' | 'md';
}

const colorClassMap: Record<ColorScheme, { bg: string; text: string; dot: string }> = {
  gray: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    dot: 'bg-neutral-400',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  orange: {
    bg: 'bg-brand-orange/10',
    text: 'text-brand-orange-dark',
    dot: 'bg-brand-orange',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

const sizeClassMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function StatusBadge({ status, type, size = 'sm' }: StatusBadgeProps) {
  const label = getStatusLabel(status, type);
  const color = getStatusColor(status, type) as ColorScheme;
  const colors = colorClassMap[color];
  const sizeClasses = sizeClassMap[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}
