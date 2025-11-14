import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/utils/format';
import { DollarSign, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfDay, subDays } from 'date-fns';

export default function Dashboard() {
  const { currentEstablishment } = useEstablishment();

  // Get today's metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', currentEstablishment?.id],
    queryFn: () =>
      analyticsApi.getDashboardMetrics(
        currentEstablishment!.id,
        startOfDay(new Date()).toISOString()
      ),
    enabled: !!currentEstablishment,
    refetchInterval: 60000, // Refetch every minute
  });

  // Get last 7 days metrics
  const { data: weekMetrics } = useQuery({
    queryKey: ['dashboard-week-metrics', currentEstablishment?.id],
    queryFn: () =>
      analyticsApi.getDashboardMetrics(
        currentEstablishment!.id,
        startOfDay(subDays(new Date(), 6)).toISOString()
      ),
    enabled: !!currentEstablishment,
  });

  // Prepare chart data (simple version)
  const chartData = weekMetrics?.orders
    ? Object.entries(
        weekMetrics.orders.reduce((acc, order) => {
          const date = new Date(order.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          });
          acc[date] = (acc[date] || 0) + (order.total_amount || 0);
          return acc;
        }, {} as Record<string, number>)
      ).map(([date, total]) => ({ date, total }))
    : [];

  if (!currentEstablishment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione um estabelecimento para ver o dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral de {currentEstablishment.name}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento Hoje
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pedidos fechados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Pedidos
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pedidos criados hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pedidos em Aberto
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.openOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando pagamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Médio
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics?.averageTicket || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor médio dos pedidos
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento dos Últimos 7 Dias</CardTitle>
          <CardDescription>
            Total de vendas diárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: 'black' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
