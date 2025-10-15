import { Card } from './Card';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  subtitle?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-gradient-card',
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-600',
      valueColor: 'text-neutral-900',
    },
    primary: {
      bg: 'bg-gradient-to-br from-primary-50 to-primary-100',
      iconBg: 'bg-primary-500',
      iconColor: 'text-white',
      valueColor: 'text-primary-900',
    },
    success: {
      bg: 'bg-gradient-to-br from-success-50 to-green-100',
      iconBg: 'bg-success-500',
      iconColor: 'text-white',
      valueColor: 'text-success-900',
    },
    warning: {
      bg: 'bg-gradient-to-br from-warning-50 to-yellow-100',
      iconBg: 'bg-warning-500',
      iconColor: 'text-white',
      valueColor: 'text-warning-900',
    },
    danger: {
      bg: 'bg-gradient-to-br from-danger-50 to-red-100',
      iconBg: 'bg-danger-500',
      iconColor: 'text-white',
      valueColor: 'text-danger-900',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={clsx(styles.bg, 'border-0', className)}>
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
            {title}
          </p>

          <p
            className={clsx(
              'text-3xl font-bold font-mono',
              styles.valueColor
            )}
          >
            {value}
          </p>

          {/* Trend or subtitle */}
          {trend && (
            <div className="flex items-center gap-1.5">
              <div
                className={clsx(
                  'flex items-center gap-1 text-sm font-medium',
                  trend.value > 0
                    ? 'text-success-600'
                    : trend.value < 0
                    ? 'text-danger-600'
                    : 'text-neutral-500'
                )}
              >
                {trend.value > 0 ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                ) : trend.value < 0 ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                ) : null}
                <span>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
              {trend.label && (
                <span className="text-xs text-neutral-500">{trend.label}</span>
              )}
            </div>
          )}

          {subtitle && !trend && (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              styles.iconBg,
              styles.iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Componentes de stats pré-configurados
export function OrdersStatsCard({ count, trend }: { count: number; trend?: number }) {
  return (
    <StatsCard
      title="Pedidos"
      value={count}
      trend={trend ? { value: trend, label: 'vs. ontem' } : undefined}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      }
      variant="primary"
    />
  );
}

export function RevenueStatsCard({ value, trend }: { value: number; trend?: number }) {
  return (
    <StatsCard
      title="Faturamento"
      value={`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      trend={trend ? { value: trend, label: 'vs. ontem' } : undefined}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      variant="success"
    />
  );
}

export function CustomersStatsCard({ count, trend }: { count: number; trend?: number }) {
  return (
    <StatsCard
      title="Clientes"
      value={count}
      trend={trend ? { value: trend, label: 'vs. ontem' } : undefined}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      variant="default"
    />
  );
}

export function AverageStatsCard({
  value,
  label,
  trend,
}: {
  value: number;
  label: string;
  trend?: number;
}) {
  return (
    <StatsCard
      title={label}
      value={value.toFixed(1)}
      trend={trend ? { value: trend, label: 'vs. ontem' } : undefined}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      }
      variant="warning"
    />
  );
}
