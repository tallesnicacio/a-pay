import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        // Base styles
        'inline-flex items-center gap-1.5',
        'font-medium rounded-sm',
        'transition-all duration-200',

        // Variants
        {
          // Primary (laranja)
          'bg-primary-100 text-primary-700 border border-primary-200':
            variant === 'primary',

          // Success (verde)
          'bg-success-100 text-success-700 border border-success-200':
            variant === 'success',

          // Warning (amarelo)
          'bg-warning-100 text-warning-700 border border-warning-200':
            variant === 'warning',

          // Danger (vermelho)
          'bg-danger-100 text-danger-700 border border-danger-200':
            variant === 'danger',

          // Neutral (cinza)
          'bg-neutral-100 text-neutral-700 border border-neutral-200':
            variant === 'neutral',

          // Info (azul)
          'bg-blue-100 text-blue-700 border border-blue-200':
            variant === 'info',
        },

        // Sizes
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
          'px-3 py-1.5 text-base': size === 'lg',
        },

        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            {
              'bg-primary-500': variant === 'primary',
              'bg-success-500': variant === 'success',
              'bg-warning-500': variant === 'warning',
              'bg-danger-500': variant === 'danger',
              'bg-neutral-500': variant === 'neutral',
              'bg-blue-500': variant === 'info',
            }
          )}
        />
      )}
      {children}
    </span>
  );
}
