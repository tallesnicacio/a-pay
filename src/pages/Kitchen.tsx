import { useQuery } from '@tanstack/react-query';
import { kitchenTicketsApi } from '@/services/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { KitchenBoard } from '@/components/kitchen/KitchenBoard';

export default function Kitchen() {
  const { currentEstablishment } = useEstablishment();

  // Fetch all kitchen tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['kitchen_tickets', currentEstablishment?.id],
    queryFn: () => kitchenTicketsApi.getByEstablishment(currentEstablishment!.id),
    enabled: !!currentEstablishment,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  if (!currentEstablishment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione um estabelecimento para ver a cozinha
        </p>
      </div>
    );
  }

  if (!currentEstablishment.has_kitchen) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Este estabelecimento não possui módulo de cozinha habilitado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cozinha</h1>
        <p className="text-muted-foreground">
          Gerencie os pedidos em preparo
        </p>
      </div>

      <KitchenBoard tickets={tickets || []} isLoading={isLoading} />
    </div>
  );
}
