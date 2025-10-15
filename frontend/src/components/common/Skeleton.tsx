import clsx from 'clsx';
import { Card } from './Card';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  circle?: boolean;
}

// Base Skeleton component
export function Skeleton({
  className,
  width,
  height,
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-neutral-200',
        {
          'rounded-full': circle,
          rounded: !circle,
        },
        className
      )}
      style={{ width, height }}
    />
  );
}

// Skeleton específicos prontos para uso

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="16px"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton height="200px" className="rounded-lg" />
        <div className="space-y-3">
          <Skeleton height="24px" width="70%" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton height="32px" width="80px" />
          <Skeleton height="40px" width="120px" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonProductCard() {
  return (
    <Card padding="none">
      {/* Image skeleton */}
      <Skeleton height="200px" className="rounded-t-lg" />

      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton height="24px" width="80%" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="60%" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton height="32px" width="100px" />
          <Skeleton height="40px" width="120px" className="rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonOrderCard() {
  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton height="20px" width="120px" />
          <Skeleton height="24px" width="60px" />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton height="16px" width="60%" />
            <Skeleton height="16px" width="80px" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton height="16px" width="50%" />
            <Skeleton height="16px" width="80px" />
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
          <Skeleton height="20px" width="80px" />
          <Skeleton height="24px" width="100px" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton height="44px" className="flex-1 rounded-lg" />
          <Skeleton height="44px" className="flex-1 rounded-lg" />
        </div>
      </div>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-neutral-200">
        <Skeleton height="20px" width="30%" />
        <Skeleton height="20px" width="25%" />
        <Skeleton height="20px" width="20%" />
        <Skeleton height="20px" width="15%" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4 py-3">
          <Skeleton height="16px" width="30%" />
          <Skeleton height="16px" width="25%" />
          <Skeleton height="16px" width="20%" />
          <Skeleton height="16px" width="15%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton circle className={sizes[size]} />;
}

export function SkeletonKanbanBoard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 4 colunas */}
      {Array.from({ length: 4 }).map((_, colIndex) => (
        <div key={colIndex} className="space-y-3">
          {/* Header da coluna */}
          <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-lg">
            <Skeleton height="20px" width="100px" />
            <Skeleton circle width="24px" height="24px" />
          </div>

          {/* Cards da coluna */}
          {Array.from({ length: 2 }).map((_, cardIndex) => (
            <Card key={cardIndex}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton height="20px" width="60px" />
                  <Skeleton height="16px" width="50px" />
                </div>
                <div className="space-y-2">
                  <Skeleton height="16px" width="100%" />
                  <Skeleton height="16px" width="80%" />
                </div>
                <Skeleton height="20px" width="80px" />
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton height="16px" width="80px" />
              <Skeleton circle width="40px" height="40px" />
            </div>
            <Skeleton height="32px" width="100px" />
            <Skeleton height="16px" width="60px" />
          </div>
        </Card>
      ))}
    </div>
  );
}
