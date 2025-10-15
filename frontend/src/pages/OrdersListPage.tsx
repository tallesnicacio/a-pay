import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { OrderCard } from '../components/common/OrderCard';
import { EmptyOrders } from '../components/common/EmptyState';
import { SkeletonOrderCard } from '../components/common/Skeleton';

export function OrdersListPage() {
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const { currentEstablishment } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentEstablishment) {
      // Fetch all orders without filter
      fetchOrders({});
    }
  }, [currentEstablishment]);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    return order.code?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unpaidOrders = filteredOrders.filter(
    (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'partial'
  );
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'paid');

  const displayedOrders = activeTab === 'unpaid' ? unpaidOrders : paidOrders;

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-neutral-600">Selecione um estabelecimento</p>
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
            <h2 className="text-3xl font-bold text-neutral-900 font-display">Comandas</h2>
            <p className="text-neutral-500 mt-1">Gerencie todas as comandas do estabelecimento</p>
          </div>
          <Button
            onClick={() => navigate('/orders/new')}
            variant="primary"
            size="lg"
            className="shadow-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Comanda
          </Button>
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Buscar por código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />

        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-neutral-200">
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-3 font-semibold transition-all relative ${
              activeTab === 'unpaid'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Não Pagos
            <Badge
              variant="danger"
              size="sm"
              className="ml-2"
            >
              {unpaidOrders.length}
            </Badge>
            {activeTab === 'unpaid' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-3 font-semibold transition-all relative ${
              activeTab === 'paid'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pagos
            <Badge
              variant="success"
              size="sm"
              className="ml-2"
            >
              {paidOrders.length}
            </Badge>
            {activeTab === 'paid' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonOrderCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayedOrders.length === 0 && (
          <EmptyOrders
            searchQuery={searchQuery}
            isPaid={activeTab === 'paid'}
            onCreateOrder={() => navigate('/orders/new')}
          />
        )}

        {/* Orders grid */}
        {!isLoading && displayedOrders.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
