import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatCurrency, formatRelativeTime } from '../utils/currency';
import type { Order } from '../types';

export function OrdersListPage() {
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const { currentEstablishment } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentEstablishment) {
      fetchOrders({ paymentStatus: activeTab });
    }
  }, [currentEstablishment, activeTab]);

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
          <p className="text-gray-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Comandas</h2>
          <Button onClick={() => navigate('/orders/new')} size="md">
            + Nova Comanda
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'unpaid'
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Não Pagos
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
              {unpaidOrders.length}
            </span>
            {activeTab === 'unpaid' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'paid'
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pagos
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
              {paidOrders.length}
            </span>
            {activeTab === 'paid' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && displayedOrders.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-2 text-gray-600">
              {searchQuery
                ? 'Nenhuma comanda encontrada'
                : activeTab === 'unpaid'
                ? 'Nenhuma comanda em aberto'
                : 'Nenhuma comanda paga'}
            </p>
          </div>
        )}

        {/* Orders grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigate(`/orders/${order.id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Order Card Component
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const isPaid = order.paymentStatus === 'paid';
  const isPartial = order.paymentStatus === 'partial';

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {order.code || `#${order.id.slice(0, 8)}`}
          </h3>
          <p className="text-sm text-gray-500">
            {formatRelativeTime(order.createdAt)}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            isPaid
              ? 'bg-green-100 text-green-800'
              : isPartial
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isPaid ? 'Pago' : isPartial ? 'Parcial' : 'Não Pago'}
        </span>
      </div>

      {/* Items count */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <span>{order.items.length} itens</span>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {isPartial && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Pago:</span>
            <span className="text-sm font-medium text-green-600">
              {formatCurrency(order.paidAmount)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
