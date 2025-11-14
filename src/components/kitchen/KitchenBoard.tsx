import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kitchenTicketsApi } from '@/services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime, formatCurrency } from '@/utils/format';
import { KitchenStatus, KitchenStatusLabels, KitchenStatusColors } from '@/constants/enums';
import { ChevronRight, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type KitchenTicket = Database['public']['Tables']['kitchen_tickets']['Row'] & {
  orders?: Database['public']['Tables']['orders']['Row'] & {
    order_items?: Array<
      Database['public']['Tables']['order_items']['Row'] & {
        products?: Database['public']['Tables']['products']['Row'];
      }
    >;
  };
};

interface KitchenBoardProps {
  tickets: KitchenTicket[];
  isLoading: boolean;
}

const statusFlow: KitchenStatus[] = [
  KitchenStatus.QUEUE,
  KitchenStatus.PREPARING,
  KitchenStatus.READY,
];

export const KitchenBoard = ({ tickets, isLoading }: KitchenBoardProps) => {
  const queryClient = useQueryClient();

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: KitchenStatus }) =>
      kitchenTicketsApi.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_tickets'] });
      toast.success('Status atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status');
      console.error(error);
    },
  });

  const moveToNextStatus = (ticket: KitchenTicket) => {
    const currentIndex = statusFlow.indexOf(ticket.status as KitchenStatus);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      updateStatusMutation.mutate({ ticketId: ticket.id, status: nextStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusFlow.map((status) => (
          <Card key={status}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statusFlow.map((status) => {
        const columnTickets = tickets.filter((t) => t.status === status);

        return (
          <Card key={status} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{KitchenStatusLabels[status]}</span>
                <Badge className={KitchenStatusColors[status]}>
                  {columnTickets.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {columnTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pedido
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-lg">
                            Pedido #{ticket.orders?.code}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ticket #{ticket.ticket_number}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {ticket.orders?.customer_name}
                          </div>
                        </div>
                        {ticket.created_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(ticket.created_at)}
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-1">
                        {ticket.orders?.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.qty}x {item.products?.name}
                            </span>
                            {item.note && (
                              <span className="text-muted-foreground italic">
                                {item.note}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      {status !== KitchenStatus.READY && (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => moveToNextStatus(ticket)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {status === KitchenStatus.QUEUE
                            ? 'Iniciar Preparo'
                            : 'Marcar como Pronto'}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
