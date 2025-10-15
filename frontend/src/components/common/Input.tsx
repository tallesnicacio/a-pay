import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', { 'w-full': fullWidth })}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={clsx(
              // Base styles
              'w-full px-4 py-3',
              'bg-white',
              'border-2',
              'rounded-lg',
              'text-neutral-800 placeholder:text-neutral-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-4',

              // States
              {
                // Normal state
                'border-neutral-200 hover:border-neutral-300':
                  !error && !props.disabled,
                'focus:border-primary-500 focus:ring-primary-100':
                  !error && !props.disabled,

                // Error state
                'border-danger-500 focus:border-danger-600 focus:ring-danger-100':
                  error,

                // Disabled state
                'bg-neutral-100 border-neutral-200 cursor-not-allowed text-neutral-500':
                  props.disabled,

                // With left icon
                'pl-11': leftIcon,

                // With right icon
                'pr-11': rightIcon,
              },

              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={clsx(
                'absolute right-3 top-1/2 -translate-y-1/2',
                error ? 'text-danger-500' : 'text-neutral-400'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Hint or error message */}
        {hint && !error && (
          <p className="text-xs text-neutral-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
