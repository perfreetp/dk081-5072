import {
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ColorScheme = 'orange' | 'green' | 'blue' | 'purple' | 'rose' | 'amber' | 'cyan';

interface Trend {
  value: number;
  label?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: Trend;
  icon: LucideIcon;
  colorScheme?: ColorScheme;
  suffix?: string;
}

const colorSchemeMap: Record<ColorScheme, {
  iconBg: string;
  iconColor: string;
  accentBg: string;
  accentBorder: string;
}> = {
  orange: {
    iconBg: 'bg-brand-orange/10',
    iconColor: 'text-brand-orange',
    accentBg: 'bg-brand-orange/5',
    accentBorder: 'border-brand-orange/10',
  },
  green: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    accentBg: 'bg-green-50',
    accentBorder: 'border-green-100',
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-100',
  },
  purple: {
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-100',
  },
  rose: {
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-100',
  },
  amber: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-100',
  },
  cyan: {
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    accentBg: 'bg-cyan-50',
    accentBorder: 'border-cyan-100',
  },
};

function TrendIndicator({ trend }: { trend: Trend }) {
  const isPositive = trend.value > 0;
  const isNeutral = trend.value === 0;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500">
        <Minus className="w-3.5 h-3.5" />
        {trend.label || '持平'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-green-600' : 'text-accent-rose'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3.5 h-3.5" />
      ) : (
        <TrendingDown className="w-3.5 h-3.5" />
      )}
      {Math.abs(trend.value)}%
      {trend.label && <span className="text-neutral-500 ml-1">{trend.label}</span>}
    </span>
  );
}

export default function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  colorScheme = 'orange',
  suffix,
}: StatCardProps) {
  const colors = colorSchemeMap[colorScheme];

  return (
    <div className={`card p-5 border ${colors.accentBorder} ${colors.accentBg} hover:shadow-card-hover transition-shadow`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-600 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-neutral-900 tabular-nums leading-tight">
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-neutral-500 font-medium">{suffix}</span>
            )}
          </div>
          {trend && (
            <div className="mt-3">
              <TrendIndicator trend={trend} />
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>
      </div>
    </div>
  );
}
