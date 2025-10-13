import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { useOrderStore } from '../stores/orderStore';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { formatCurrency, formatDate } from '../utils/currency';
import type { Order } from '../types';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markAsPaid } = useOrderStore();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (error) {
      showToast('Erro ao carregar comanda', 'error');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (
    method: 'cash' | 'card' | 'pix',
    amount?: number
  ) => {
    if (!id) return;

    try {
      await markAsPaid(id, { method, amount });
      showToast('Pagamento registrado com sucesso!', 'success');
      setShowPaymentModal(false);
      await loadOrder(); // Recarregar
    } catch (error) {
      showToast('Erro ao registrar pagamento', 'error');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Comanda não encontrada</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isPartial = order.paymentStatus === 'partial';
  const remainingAmount = Number(order.totalAmount) - Number(order.paidAmount);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {order.code || `Comanda #${order.id.slice(0, 8)}`}
            </h2>
            <p className="text-sm text-gray-600">
              Criada em {formatDate(order.createdAt)}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Voltar
          </Button>
        </div>

        {/* Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status do Pagamento:</p>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  isPaid
                    ? 'bg-green-100 text-green-800'
                    : isPartial
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isPaid ? 'Pago' : isPartial ? 'Parcialmente Pago' : 'Não Pago'}
              </span>
            </div>

            {!isPaid && (
              <Button onClick={() => setShowPaymentModal(true)}>
                Marcar como Pago
              </Button>
            )}
          </div>
        </Card>

        {/* Items */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Itens ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  {item.note && (
                    <p className="text-sm text-gray-500 italic">Obs: {item.note}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.unitPrice)} × {item.qty}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(Number(item.unitPrice) * item.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {isPartial && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pago:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(order.paidAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Restante:</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Payments history */}
        {order.payments && order.payments.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Histórico de Pagamentos
            </h3>
            <div className="space-y-2">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.method === 'cash'
                        ? 'Dinheiro'
                        : payment.method === 'card'
                        ? 'Cartão'
                        : 'PIX'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(payment.receivedAt)}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Creator info */}
        {order.creator && (
          <Card>
            <p className="text-sm text-gray-600">
              Criada por:{' '}
              <span className="font-medium text-gray-900">
                {order.creator.name}
              </span>
            </p>
          </Card>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={Number(order.totalAmount)}
          paidAmount={Number(order.paidAmount)}
          onPay={handlePayment}
        />
      </div>
    </Layout>
  );
}

// Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  paidAmount: number;
  onPay: (method: 'cash' | 'card' | 'pix', amount?: number) => Promise<void>;
}

function PaymentModal({
  isOpen,
  onClose,
  totalAmount,
  paidAmount,
  onPay,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [isLoading, setIsLoading] = useState(false);

  const remainingAmount = totalAmount - paidAmount;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onPay(method, remainingAmount);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pagamento">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Valor a pagar:</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(remainingAmount)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forma de Pagamento:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['cash', 'card', 'pix'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  method === m
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m === 'cash' ? 'Dinheiro' : m === 'card' ? 'Cartão' : 'PIX'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} fullWidth isLoading={isLoading}>
            Confirmar Pagamento
          </Button>
        </div>
      </div>
    </Modal>
  );
}
