import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-semibold rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-4',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',

        // Variant styles
        {
          // Primary - Laranja vibrante com sombra colorida
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700':
            variant === 'primary' && !disabled,
          'shadow-primary hover:shadow-xl focus:ring-primary-100':
            variant === 'primary',

          // Secondary - Branco com borda
          'bg-white text-neutral-700 border-2 border-neutral-300':
            variant === 'secondary' && !disabled,
          'hover:bg-neutral-50 active:bg-neutral-100':
            variant === 'secondary' && !disabled,

          // Ghost - Transparente
          'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200':
            variant === 'ghost' && !disabled,

          // Focus ring para secondary e ghost
          'focus:ring-neutral-200':
            variant === 'secondary' || variant === 'ghost',

          // Danger - Vermelho
          'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700':
            variant === 'danger' && !disabled,
          'shadow-md hover:shadow-xl focus:ring-danger-100':
            variant === 'danger',

          // Success - Verde
          'bg-success-500 text-white hover:bg-success-600 active:bg-success-700':
            variant === 'success' && !disabled,
          'shadow-success hover:shadow-xl focus:ring-success-100':
            variant === 'success',
        },

        // Size styles
        {
          'px-3 py-2 text-sm min-h-[40px]': size === 'sm',
          'px-4 py-2.5 text-base min-h-[44px]': size === 'md',
          'px-6 py-3 text-lg min-h-[48px]': size === 'lg',
          'px-8 py-4 text-xl min-h-[56px]': size === 'xl',
        },

        // Full width
        {
          'w-full': fullWidth,
        },

        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
