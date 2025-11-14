import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, paymentsApi } from '@/services/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Ban } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/format';
import {
  OrderStatusLabels,
  PaymentStatusLabels,
  PaymentMethodLabels,
  OrderStatusColors,
  PaymentStatusColors,
} from '@/constants/enums';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Array<
    Database['public']['Tables']['order_items']['Row'] & {
      products?: Database['public']['Tables']['products']['Row'];
    }
  >;
  payments?: Database['public']['Tables']['payments']['Row'][];
};

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export const OrderDetailsDialog = ({ order, open, onClose }: OrderDetailsDialogProps) => {
  const queryClient = useQueryClient();

  // Fetch full order details with payments
  const { data: fullOrder } = useQuery({
    queryKey: ['order', order?.id],
    queryFn: () => ordersApi.getById(order!.id),
    enabled: !!order && open,
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(order!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order!.id] });
      toast.success('Pedido cancelado');
      onClose();
    },
    onError: (error) => {
      toast.error('Erro ao cancelar pedido');
      console.error(error);
    },
  });

  if (!order) return null;

  const displayOrder = fullOrder || order;
  const canCancel = displayOrder.status === 'open';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Pedido #{displayOrder.code}</DialogTitle>
              <DialogDescription>
                Cliente: {displayOrder.customer_name}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={OrderStatusColors[displayOrder.status]}>
                {OrderStatusLabels[displayOrder.status]}
              </Badge>
              <Badge
                variant="outline"
                className={PaymentStatusColors[displayOrder.payment_status]}
              >
                {PaymentStatusLabels[displayOrder.payment_status]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <div className="space-y-2">
                {displayOrder.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.products?.name || 'Produto'}
                      </div>
                      {item.note && (
                        <div className="text-sm text-muted-foreground">
                          Obs: {item.note}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} x {item.qty}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(item.unit_price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Payments */}
            {displayOrder.payments && displayOrder.payments.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Pagamentos</h3>
                  <div className="space-y-2">
                    {displayOrder.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {PaymentMethodLabels[payment.method]}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(payment.received_at)}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">
                  {formatCurrency(displayOrder.total_amount || 0)}
                </span>
              </div>
              {displayOrder.paid_amount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pago:</span>
                    <span className="font-semibold">
                      {formatCurrency(displayOrder.paid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Restante:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        (displayOrder.total_amount || 0) - displayOrder.paid_amount
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Criado em: {formatDateTime(displayOrder.created_at)}</div>
              {displayOrder.closed_at && (
                <div>Fechado em: {formatDateTime(displayOrder.closed_at)}</div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              <Ban className="mr-2 h-4 w-4" />
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar Pedido'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="ml-auto">
            <X className="mr-2 h-4 w-4" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
