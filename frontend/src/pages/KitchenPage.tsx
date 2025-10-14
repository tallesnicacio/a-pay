import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useKitchenStore } from '../stores/kitchenStore';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { KanbanBoard } from '../components/kitchen/KanbanBoard';
import { useSSE } from '../hooks/useSSE';
import type { KitchenTicket } from '../types';

export function KitchenPage() {
  const { currentEstablishment } = useAuthStore();
  const { tickets, stats, isLoading, fetchTickets, fetchStats, addTicket, updateTicket } =
    useKitchenStore();

  // Carregar tickets ao montar
  useEffect(() => {
    if (currentEstablishment) {
      fetchTickets();
      fetchStats();

      // Refresh a cada 30 segundos (fallback se SSE falhar)
      const interval = setInterval(() => {
        fetchTickets();
        fetchStats();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentEstablishment]);

  // SSE para real-time updates
  const handleSSEMessage = useCallback(
    (event: { type: string; data: any }) => {
      console.log('[Kitchen] SSE event:', event);

      switch (event.type) {
        case 'ticket_created':
          // Novo ticket criado
          addTicket(event.data as KitchenTicket);
          // Som de notificação (opcional)
          playNotificationSound();
          break;

        case 'ticket_updated':
          // Ticket atualizado
          updateTicket(event.data as KitchenTicket);
          break;

        default:
          console.log('[Kitchen] Unknown SSE event type:', event.type);
      }
    },
    [addTicket, updateTicket]
  );

  const { isConnected } = useSSE(handleSSEMessage);

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  // Verificar se usuário tem acesso ao módulo de cozinha
  const userRole = useAuthStore.getState().user?.roles.find(
    (r) => r.establishmentId === currentEstablishment.id
  );

  // Verificar permissões
  const hasKitchenAccess =
    userRole?.role === 'admin_global' ||
    userRole?.role === 'owner' ||
    (userRole?.role === 'user' && userRole?.permissions?.modules?.kitchen);

  if (!hasKitchenAccess) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">
            Você não tem permissão para acessar o módulo de cozinha
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cozinha</h2>
            <p className="text-sm text-gray-600">{currentEstablishment.name}</p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {/* SSE connection status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-gray-600">
                {isConnected ? 'Tempo real ativo' : 'Desconectado'}
              </span>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => {
                fetchTickets();
                fetchStats();
              }}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar"
            >
              <svg
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card padding="sm">
              <p className="text-xs text-gray-600 mb-1">Fila</p>
              <p className="text-2xl font-bold text-gray-900">{stats.queue}</p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-600 mb-1">Em Preparo</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.preparing}
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-600 mb-1">Pronto</p>
              <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-600 mb-1">Entregues Hoje</p>
              <p className="text-2xl font-bold text-gray-600">
                {stats.delivered}
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-gray-600 mb-1">Tempo Médio</p>
              <p className="text-2xl font-bold text-primary-600">
                {stats.averageTimeMinutes}
                <span className="text-sm text-gray-600 ml-1">min</span>
              </p>
            </Card>
          </div>
        )}

        {/* Kanban Board */}
        {isLoading && tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando tickets...</p>
          </div>
        ) : (
          <KanbanBoard tickets={tickets} />
        )}
      </div>
    </Layout>
  );
}

// Helper function para tocar som de notificação
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch((e) => console.log('Could not play sound:', e));
  } catch (error) {
    // Silenciar erro se não tiver áudio
  }
}
