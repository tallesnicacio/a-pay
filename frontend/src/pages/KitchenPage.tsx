import { useEffect, useCallback, useState, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useKitchenStore } from '../stores/kitchenStore';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { StatsCard } from '../components/common/StatsCard';
import { EmptyKitchen } from '../components/common/EmptyState';
import { SkeletonKanbanBoard } from '../components/common/Skeleton';
import { KanbanBoard } from '../components/kitchen/KanbanBoard';
import { useSSE } from '../hooks/useSSE';
import type { KitchenTicket } from '../types';

export function KitchenPage() {
  const { currentEstablishment } = useAuthStore();
  const { tickets, stats, isLoading, fetchTickets, fetchStats, addTicket, updateTicket } =
    useKitchenStore();
  const [hideDelivered, setHideDelivered] = useState(false);

  // Filtrar tickets entregues se hideDelivered estiver ativo
  const filteredTickets = useMemo(() => {
    if (!hideDelivered) return tickets;
    return tickets.filter(ticket => ticket.status !== 'delivered');
  }, [tickets, hideDelivered]);

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
      }
    },
    [addTicket, updateTicket]
  );

  const { isConnected } = useSSE(handleSSEMessage);

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-neutral-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  // Verificar se usuário tem acesso ao módulo de cozinha
  const userRole = useAuthStore.getState().user?.roles.find(
    (r) => r.establishmentId === currentEstablishment.id
  );

  // Verificar permissões
  // Funcionários têm acesso automático se o módulo estiver habilitado no estabelecimento
  const hasKitchenAccess =
    userRole?.role === 'admin_global' ||
    userRole?.role === 'owner' ||
    (userRole?.role === 'user' && currentEstablishment?.hasKitchen === true);

  if (!hasKitchenAccess) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-danger-100 text-danger-600 rounded-2xl mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-danger-600 mb-2 font-display">403</h1>
          <p className="text-neutral-600">
            Você não tem permissão para acessar o módulo de cozinha
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 font-display">Cozinha</h2>
            <p className="text-neutral-500 mt-1">{currentEstablishment.name}</p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            {/* SSE connection status */}
            <Badge
              variant={isConnected ? 'success' : 'danger'}
              dot
              className="hidden sm:flex"
            >
              {isConnected ? 'Tempo real ativo' : 'Desconectado'}
            </Badge>

            {/* Mobile: apenas o dot */}
            <div className="sm:hidden">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-success-500 shadow-success' : 'bg-danger-500 shadow-danger'
                } animate-pulse`}
              />
            </div>

            {/* Hide/Show delivered button */}
            <Button
              onClick={() => setHideDelivered(!hideDelivered)}
              variant={hideDelivered ? 'primary' : 'ghost'}
              size="md"
              title={hideDelivered ? 'Mostrar entregues' : 'Ocultar entregues'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {hideDelivered ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                )}
              </svg>
              <span className="hidden sm:inline">{hideDelivered ? 'Mostrar' : 'Ocultar'} entregues</span>
            </Button>

            {/* Refresh button */}
            <Button
              onClick={() => {
                fetchTickets();
                fetchStats();
              }}
              disabled={isLoading}
              variant="ghost"
              size="md"
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
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              label="Fila"
              value={stats.queue}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="warning"
            />

            <StatsCard
              label="Em Preparo"
              value={stats.preparing}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              }
              color="info"
            />

            <StatsCard
              label="Pronto"
              value={stats.ready}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="success"
            />

            <StatsCard
              label="Entregues Hoje"
              value={stats.delivered}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
              color="neutral"
            />

            <StatsCard
              label="Tempo Médio"
              value={`${stats.averageTimeMinutes}min`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              color="primary"
              className="col-span-2 sm:col-span-1"
            />
          </div>
        )}

        {/* Kanban Board */}
        {isLoading && filteredTickets.length === 0 ? (
          <SkeletonKanbanBoard />
        ) : filteredTickets.length === 0 ? (
          <EmptyKitchen />
        ) : (
          <KanbanBoard tickets={filteredTickets} />
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
  } catch (error) {
    // Silenciar erro se não tiver áudio
  }
}
