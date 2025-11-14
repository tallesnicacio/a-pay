import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CashierOrderCard } from '@/components/cashier/CashierOrderCard';
import { PaymentDialog } from '@/components/cashier/PaymentDialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Array<
    Database['public']['Tables']['order_items']['Row'] & {
      products?: Database['public']['Tables']['products']['Row'];
    }
  >;
};

export default function Cashier() {
  const { currentEstablishment } = useEstablishment();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch open orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'open', currentEstablishment?.id],
    queryFn: () => ordersApi.getByEstablishment(currentEstablishment!.id, 'open'),
    enabled: !!currentEstablishment,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!currentEstablishment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione um estabelecimento para ver o caixa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
        <p className="text-muted-foreground">
          Gerencie pagamentos e feche pedidos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos em Aberto</CardTitle>
          <CardDescription>
            {orders?.length || 0} pedido(s) aguardando pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum pedido em aberto
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <CashierOrderCard
                  key={order.id}
                  order={order}
                  onPayment={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
