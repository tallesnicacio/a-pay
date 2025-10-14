import { useState, useEffect } from 'react';
import { retryQueue } from '../../services/retryQueue';

export function RetryQueueIndicator() {
  const [queueSize, setQueueSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update queue size periodically
    const updateQueueSize = () => {
      setQueueSize(retryQueue.size);
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 1000);

    // Listen to online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateQueueSize();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueueSize();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (queueSize === 0 && isOnline) {
    return null; // Don't show anything when online and queue is empty
  }

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm p-3 rounded-lg shadow-lg z-50 ${
        isOnline
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isOnline ? 'bg-blue-100' : 'bg-yellow-100'
          }`}
        >
          {isOnline ? (
            <svg
              className="w-5 h-5 text-blue-600 animate-spin"
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
          ) : (
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.415 1 1 0 01-1.414-1.415zm-1.414 5.658a1 1 0 111.414 1.415 1 1 0 01-1.414-1.415z"
              />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {isOnline ? (
            <>
              <p className="text-sm font-medium text-blue-900">
                Sincronizando operações pendentes
              </p>
              <p className="text-xs text-blue-700">
                {queueSize} operação{queueSize !== 1 ? 'ões' : ''} na fila
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-yellow-900">Sem conexão</p>
              <p className="text-xs text-yellow-700">
                {queueSize > 0
                  ? `${queueSize} operação${queueSize !== 1 ? 'ões' : ''} serão sincronizadas quando voltar online`
                  : 'Suas operações serão salvas localmente'}
              </p>
            </>
          )}
        </div>

        {/* Clear queue button */}
        {queueSize > 0 && (
          <button
            onClick={() => {
              if (confirm(`Limpar ${queueSize} operação${queueSize !== 1 ? 'ões' : ''} pendente${queueSize !== 1 ? 's' : ''}?`)) {
                retryQueue.clear();
                setQueueSize(0);
              }
            }}
            className="flex-shrink-0 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
            title="Limpar fila"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
