import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={clsx('flex flex-col gap-1', { 'w-full': fullWidth })}>
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'input',
            {
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
