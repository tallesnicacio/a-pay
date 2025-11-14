import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateTime } from '@/utils/format';
import {
  OrderStatusLabels,
  PaymentStatusLabels,
  OrderStatusColors,
  PaymentStatusColors,
} from '@/constants/enums';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Array<
    Database['public']['Tables']['order_items']['Row'] & {
      products?: Database['public']['Tables']['products']['Row'];
    }
  >;
};

interface OrdersListProps {
  orders: Order[];
  isLoading: boolean;
  emptyMessage: string;
}

export const OrdersList = ({ orders, isLoading, emptyMessage }: OrdersListProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-bold text-lg">
                      #{order.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer_name}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={OrderStatusColors[order.status]}>
                      {OrderStatusLabels[order.status]}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(order.total_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <Badge
                      variant="outline"
                      className={PaymentStatusColors[order.payment_status]}
                    >
                      {PaymentStatusLabels[order.payment_status]}
                    </Badge>
                  </div>
                  {order.paid_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pago:</span>
                      <span>{formatCurrency(order.paid_amount)}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
};
