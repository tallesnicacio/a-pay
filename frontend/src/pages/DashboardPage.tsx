import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersStatsCard, RevenueStatsCard, CustomersStatsCard, AverageStatsCard } from '../components/common/StatsCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SkeletonStats } from '../components/common/Skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  todayCustomers: number;
  avgRating: number;
  ordersGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
  ratingGrowth: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  table: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
}

interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const greeting = getGreeting();

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        todayOrders: 45,
        todayRevenue: 2340.50,
        todayCustomers: 87,
        avgRating: 4.8,
        ordersGrowth: 12,
        revenueGrowth: 8,
        customersGrowth: 5,
        ratingGrowth: 0.2,
      });

      setRecentOrders([
        {
          id: '1',
          orderNumber: '1234',
          table: '12',
          total: 85.50,
          status: 'preparing',
          createdAt: new Date(),
        },
        {
          id: '2',
          orderNumber: '1235',
          table: '8',
          total: 42.00,
          status: 'ready',
          createdAt: new Date(Date.now() - 300000),
        },
        {
          id: '3',
          orderNumber: '1236',
          table: '5',
          total: 120.00,
          status: 'pending',
          createdAt: new Date(Date.now() - 600000),
        },
      ]);

      setTopProducts([
        { id: '1', name: 'Hambúrguer Artesanal', quantity: 23, revenue: 664.70 },
        { id: '2', name: 'Batata Frita', quantity: 18, revenue: 270.00 },
        { id: '3', name: 'Refrigerante 350ml', quantity: 35, revenue: 210.00 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  const statusConfig = {
    pending: { label: 'Aguardando', variant: 'warning' as const },
    preparing: { label: 'Em Preparo', variant: 'info' as const },
    ready: { label: 'Pronto', variant: 'success' as const },
    delivered: { label: 'Entregue', variant: 'neutral' as const },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-neutral-200 rounded animate-pulse" />
        </div>
        <SkeletonStats />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header com saudação */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-1">
            {greeting}! 👋
          </h1>
          <p className="text-neutral-500 capitalize">{currentDate}</p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/orders/new')}
          className="shadow-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Novo Pedido
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OrdersStatsCard count={stats.todayOrders} trend={stats.ordersGrowth} />
          <RevenueStatsCard value={stats.todayRevenue} trend={stats.revenueGrowth} />
          <CustomersStatsCard count={stats.todayCustomers} trend={stats.customersGrowth} />
          <AverageStatsCard
            value={stats.avgRating}
            label="Avaliação Média"
            trend={stats.ratingGrowth}
          />
        </div>
      )}

      {/* Grid de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos Recentes */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 font-display">
              Pedidos Recentes
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                    <span className="text-white font-bold font-mono">
                      {order.table}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Mesa {order.table}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={statusConfig[order.status].variant}>
                    {statusConfig[order.status].label}
                  </Badge>
                  <p className="font-bold text-neutral-900 font-mono">
                    R$ {order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900 font-display">
              Top Produtos
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reports')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </Button>
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {product.quantity} vendidos
                  </p>
                </div>
                <p className="font-bold text-neutral-900 font-mono text-sm">
                  R$ {product.revenue.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <h2 className="text-xl font-bold text-neutral-900 font-display mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/orders/new')}
            className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Novo Pedido</p>
          </button>

          <button
            onClick={() => navigate('/kitchen')}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Cozinha</p>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Produtos</p>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-900">Relatórios</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
