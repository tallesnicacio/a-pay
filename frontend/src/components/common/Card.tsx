import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'bordered';
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = 'md',
  variant = 'default',
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={clsx(
        // Base styles
        'rounded-lg',
        'transition-all duration-300',

        // Variants
        {
          // Default - Branco com sombra sutil
          'bg-white shadow-md': variant === 'default',

          // Gradient - Com gradiente suave
          'bg-gradient-card shadow-lg': variant === 'gradient',

          // Bordered - Com borda
          'bg-white border-2 border-neutral-200 shadow-sm': variant === 'bordered',
        },

        // Padding
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4 md:p-5': padding === 'md',
          'p-6 md:p-8': padding === 'lg',
        },

        // Interactive states
        {
          'cursor-pointer': onClick || hoverable,
          'hover:shadow-xl hover:-translate-y-1': (onClick || hoverable) && variant !== 'bordered',
          'hover:border-primary-300 hover:shadow-md': (onClick || hoverable) && variant === 'bordered',
        },

        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
