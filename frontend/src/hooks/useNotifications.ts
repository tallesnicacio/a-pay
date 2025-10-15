import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/common/Toast';

export interface Notification {
  id: string;
  type: 'new_order' | 'order_updated' | 'order_paid' | 'kitchen_ready';
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
}

interface UseNotificationsOptions {
  enabled?: boolean;
  onNotification?: (notification: Notification) => void;
}

/**
 * Hook personalizado para conectar ao SSE de notificações em tempo real
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true, onNotification } = options;
  const { token, currentEstablishment } = useAuthStore();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!enabled || !token || !currentEstablishment) {
      return;
    }

    // Se já está conectado, não reconectar
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const url = `${API_URL}/notifications/stream`;

    // EventSource não suporta headers customizados, então passamos token via query param
    const eventSource = new EventSource(`${url}?token=${token}`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      console.log('✅ Notificações: Conectado ao SSE');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);

        // Adicionar notificação à lista
        setNotifications((prev) => [notification, ...prev].slice(0, 50));

        // Callback personalizado
        if (onNotification) {
          onNotification(notification);
        }

        // Exibir toast baseado no tipo de notificação
        if (notification.type === 'new_order') {
          showToast(notification.message, 'info', {
            duration: 6000,
            icon: '🔔',
          });

          // Reproduzir som de notificação (opcional)
          playNotificationSound();
        }
      } catch (error) {
        console.error('Erro ao processar notificação:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Erro SSE:', error);
      setIsConnected(false);
      eventSource.close();

      // Tentar reconectar após 5 segundos
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Tentando reconectar ao SSE...');
        connect();
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [enabled, token, currentEstablishment, onNotification, showToast]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    notifications,
    isConnected,
    clearNotifications,
    reconnect: connect,
  };
}

/**
 * Reproduzir som de notificação
 */
function playNotificationSound() {
  try {
    // Criar um som simples usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Silenciosamente falhar se não puder tocar o som
    console.warn('Não foi possível reproduzir som de notificação:', error);
  }
}
