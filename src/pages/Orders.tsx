import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ordersApi } from '@/services/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersList } from '@/components/orders/OrdersList';
import { NewOrderDialog } from '@/components/orders/NewOrderDialog';
import { OrderStatus } from '@/constants/enums';

export default function Orders() {
  const { currentEstablishment } = useEstablishment();
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('open');

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', currentEstablishment?.id, activeTab],
    queryFn: () =>
      ordersApi.getByEstablishment(
        currentEstablishment!.id,
        activeTab as OrderStatus
      ),
    enabled: !!currentEstablishment,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!currentEstablishment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione um estabelecimento para ver os pedidos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos do estabelecimento
          </p>
        </div>
        <Button onClick={() => setIsNewOrderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">Abertos</TabsTrigger>
          <TabsTrigger value="closed">Fechados</TabsTrigger>
          <TabsTrigger value="canceled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <OrdersList
            orders={orders || []}
            isLoading={isLoading}
            emptyMessage="Nenhum pedido aberto"
          />
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          <OrdersList
            orders={orders || []}
            isLoading={isLoading}
            emptyMessage="Nenhum pedido fechado"
          />
        </TabsContent>

        <TabsContent value="canceled" className="space-y-4">
          <OrdersList
            orders={orders || []}
            isLoading={isLoading}
            emptyMessage="Nenhum pedido cancelado"
          />
        </TabsContent>
      </Tabs>

      <NewOrderDialog
        open={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}
