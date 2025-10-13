import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Variants
          'btn-primary focus:ring-primary-500': variant === 'primary',
          'btn-secondary focus:ring-gray-400': variant === 'secondary',
          'btn-success focus:ring-green-500': variant === 'success',
          'btn-danger focus:ring-red-500': variant === 'danger',
          'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100':
            variant === 'outline',

          // Sizes
          'px-3 py-2 text-sm min-h-[40px]': size === 'sm',
          'px-4 py-3 text-base min-h-[48px]': size === 'md',
          'px-6 py-4 text-lg min-h-[56px]': size === 'lg',

          // Full width
          'w-full': fullWidth,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
