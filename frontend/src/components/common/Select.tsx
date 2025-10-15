import { useState, useRef, useEffect, ReactNode } from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

interface SelectProps {
  label?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  error,
  hint,
  disabled = false,
  fullWidth = true,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={clsx('flex flex-col gap-1.5', { 'w-full': fullWidth })}
    >
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            // Base styles
            'w-full px-4 py-3',
            'bg-white',
            'border-2',
            'rounded-lg',
            'text-left',
            'flex items-center justify-between gap-2',
            'transition-all duration-200',
            'focus:outline-none focus:ring-4',

            // States
            {
              // Normal state
              'border-neutral-200 hover:border-neutral-300':
                !error && !disabled && !isOpen,
              'focus:border-primary-500 focus:ring-primary-100':
                !error && !disabled,

              // Open state
              'border-primary-500 ring-4 ring-primary-100': isOpen && !error,

              // Error state
              'border-danger-500 focus:border-danger-600 focus:ring-danger-100':
                error,

              // Disabled state
              'bg-neutral-100 border-neutral-200 cursor-not-allowed text-neutral-500':
                disabled,
            },

            className
          )}
        >
          {/* Selected value or placeholder */}
          <span
            className={clsx('flex items-center gap-2 flex-1', {
              'text-neutral-400': !selectedOption,
              'text-neutral-800': selectedOption,
            })}
          >
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Chevron icon */}
          <svg
            className={clsx(
              'w-5 h-5 transition-transform duration-200',
              isOpen ? 'rotate-180' : 'rotate-0',
              error ? 'text-danger-500' : 'text-neutral-400'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 animate-slide-in-up">
            <div
              className={clsx(
                'bg-white',
                'border-2 border-neutral-200',
                'rounded-lg',
                'shadow-xl',
                'max-h-60 overflow-auto',
                'py-1'
              )}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full px-4 py-3',
                    'flex items-center gap-2',
                    'text-left transition-colors',
                    {
                      // Selected state
                      'bg-primary-50 text-primary-700 font-medium':
                        option.value === value,

                      // Normal state
                      'text-neutral-800 hover:bg-neutral-50':
                        option.value !== value && !option.disabled,

                      // Disabled state
                      'text-neutral-400 cursor-not-allowed': option.disabled,
                    }
                  )}
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="flex-1">{option.label}</span>

                  {/* Check icon for selected */}
                  {option.value === value && (
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hint or error message */}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-danger-600 font-medium">{error}</p>}
    </div>
  );
}
