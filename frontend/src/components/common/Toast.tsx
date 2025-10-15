import { useEffect } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  title?: string;
}

export function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
  title,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: (
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      colors: 'bg-success-50 text-success-800 border-success-300',
      iconColor: 'text-success-500',
    },
    error: {
      icon: (
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
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      colors: 'bg-danger-50 text-danger-800 border-danger-300',
      iconColor: 'text-danger-500',
    },
    warning: {
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      colors: 'bg-warning-50 text-warning-800 border-warning-300',
      iconColor: 'text-warning-500',
    },
    info: {
      icon: (
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      colors: 'bg-blue-50 text-blue-800 border-blue-300',
      iconColor: 'text-blue-500',
    },
  };

  const currentConfig = config[type];

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50',
        'flex items-start gap-3',
        'px-4 py-4',
        'rounded-xl shadow-xl border-2',
        'min-w-[320px] max-w-md',
        'animate-slide-in-right',
        currentConfig.colors
      )}
    >
      <div className={clsx('flex-shrink-0 mt-0.5', currentConfig.iconColor)}>
        {currentConfig.icon}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-base mb-1">{title}</h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>

      <button
        onClick={onClose}
        className={clsx(
          'flex-shrink-0',
          'p-1 rounded-lg',
          'transition-colors',
          'hover:bg-black/5'
        )}
        aria-label="Fechar notificação"
      >
        <svg
          className="w-5 h-5 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// Hook para gerenciar toasts
import { create } from 'zustand';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  title?: string;
  showToast: (message: string, type: ToastType, title?: string) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  isVisible: false,
  title: undefined,
  showToast: (message, type, title) =>
    set({ message, type, title, isVisible: true }),
  hideToast: () => set({ isVisible: false }),
}));
