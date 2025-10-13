import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        {
          'p-0': padding === 'none',
          'p-2': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
          'cursor-pointer hover:shadow-md transition-shadow': onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
