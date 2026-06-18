import type { Priority } from '@/types/order';
import { getPriorityLabel, getPriorityColor } from '@/utils/formatters';
import {
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
} from 'lucide-react';

type ColorScheme = 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'amber' | 'cyan' | 'rose';

interface PriorityTagProps {
  priority: Priority;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const colorClassMap: Record<ColorScheme, { bg: string; text: string; border: string }> = {
  gray: {
    bg: 'bg-neutral-50',
    text: 'text-neutral-600',
    border: 'border-neutral-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  orange: {
    bg: 'bg-brand-orange/10',
    text: 'text-brand-orange-dark',
    border: 'border-brand-orange/20',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

const sizeClassMap = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

const iconSizeClassMap = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

function PriorityIcon({ priority, className }: { priority: Priority; className: string }) {
  switch (priority) {
    case 'LOW':
      return <ArrowDown className={className} />;
    case 'NORMAL':
      return <Minus className={className} />;
    case 'HIGH':
      return <ArrowUp className={className} />;
    case 'URGENT':
      return <AlertTriangle className={className} />;
    default:
      return null;
  }
}

export default function PriorityTag({ priority, size = 'sm', showIcon = true }: PriorityTagProps) {
  const label = getPriorityLabel(priority);
  const color = getPriorityColor(priority) as ColorScheme;
  const colors = colorClassMap[color];
  const sizeClasses = sizeClassMap[size];
  const iconSize = iconSizeClassMap[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {showIcon && <PriorityIcon priority={priority} className={iconSize} />}
      {label}
    </span>
  );
}
