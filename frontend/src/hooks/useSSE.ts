import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

interface SSEEvent {
  type: string;
  data: any;
}

export function useSSE(onMessage: (event: SSEEvent) => void) {
  const { token, currentEstablishment } = useAuthStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  // Stable reference to onMessage
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token || !currentEstablishment) {
      setIsConnected(false);
      return;
    }

    // Auto-detect API URL based on current host (for mobile access)
    const getApiUrl = () => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      const hostname = window.location.hostname;
      return `http://${hostname}:3000`;
    };

    const API_URL = getApiUrl();
    const url = `${API_URL}/sse/kitchen?token=${token}&establishmentId=${currentEstablishment.id}`;

    console.log('[SSE] Connecting to:', url);

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
      setIsConnected(true);
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.addEventListener('connected', (event) => {
      console.log('[SSE] Connected:', event.data);
    });

    eventSource.addEventListener('heartbeat', () => {
      // Heartbeat para manter conexão viva
      console.log('[SSE] Heartbeat received');
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Message received:', data);
        onMessageRef.current(data);
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[SSE] Error:', error);
      setIsConnected(false);
      eventSource.close();

      // Tentar reconectar após 5 segundos
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[SSE] Attempting to reconnect...');
          reconnectTimeoutRef.current = null;
          setReconnectTrigger(prev => prev + 1);
        }, 5000);
      }
    };

    // Cleanup
    return () => {
      console.log('[SSE] Closing connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      eventSource.close();
      setIsConnected(false);
    };
  }, [token, currentEstablishment, reconnectTrigger]);

  return {
    isConnected,
  };
}
