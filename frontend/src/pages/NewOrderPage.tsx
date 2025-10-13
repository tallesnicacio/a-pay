import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../stores/orderStore';
import { useAuthStore } from '../stores/authStore';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { formatCurrency } from '../utils/currency';
import type { Product, CreateOrderItem } from '../types';

export function NewOrderPage() {
  const navigate = useNavigate();
  const { products, fetchProducts, createOrder, isLoading } = useOrderStore();
  const { currentEstablishment } = useAuthStore();
  const { showToast } = useToast();

  const [code, setCode] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, CreateOrderItem>>(
    new Map()
  );
  const [payNow, setPayNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');

  useEffect(() => {
    if (currentEstablishment) {
      fetchProducts();
    }
  }, [currentEstablishment]);

  const handleAddItem = (product: Product) => {
    const newItems = new Map(selectedItems);
    const existing = newItems.get(product.id);

    if (existing) {
      newItems.set(product.id, {
        ...existing,
        qty: existing.qty + 1,
      });
    } else {
      newItems.set(product.id, {
        productId: product.id,
        qty: 1,
      });
    }

    setSelectedItems(newItems);
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    const newItems = new Map(selectedItems);

    if (qty <= 0) {
      newItems.delete(productId);
    } else {
      const existing = newItems.get(productId);
      if (existing) {
        newItems.set(productId, { ...existing, qty });
      }
    }

    setSelectedItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        total += Number(product.price) * item.qty;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      showToast('Adicione pelo menos um item', 'warning');
      return;
    }

    try {
      const order = await createOrder({
        code: code || undefined,
        items: Array.from(selectedItems.values()),
        payNow,
        paymentMethod: payNow ? paymentMethod : undefined,
      });

      showToast('Comanda criada com sucesso!', 'success');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      showToast('Erro ao criar comanda', 'error');
    }
  };

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  const total = calculateTotal();
  const itemsCount = Array.from(selectedItems.values()).reduce(
    (acc, item) => acc + item.qty,
    0
  );

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nova Comanda</h2>
            <p className="text-sm text-gray-600">
              {currentEstablishment.name}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            Cancelar
          </Button>
        </div>

        {/* Code input */}
        <Card>
          <Input
            label="Código da Comanda (opcional)"
            placeholder="Ex: Mesa 5, Cliente João..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Card>

        {/* Products grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Produtos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductButton
                key={product.id}
                product={product}
                selectedQty={selectedItems.get(product.id)?.qty || 0}
                onAdd={() => handleAddItem(product)}
              />
            ))}
          </div>

          {products.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-600">
              Nenhum produto disponível
            </div>
          )}
        </div>

        {/* Selected items */}
        {selectedItems.size > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Itens Selecionados ({itemsCount})
            </h3>
            <div className="space-y-2">
              {Array.from(selectedItems.entries()).map(([productId, item]) => {
                const product = products.find((p) => p.id === productId);
                if (!product) return null;

                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(product.price)} × {item.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(productId, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(productId, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900 min-w-[80px] text-right">
                        {formatCurrency(Number(product.price) * item.qty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(total)}
              </span>
            </div>
          </Card>
        )}

        {/* Payment options */}
        {selectedItems.size > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pagamento
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="payNow"
                checked={payNow}
                onChange={(e) => setPayNow(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="payNow" className="text-sm font-medium text-gray-900">
                Pagar agora
              </label>
            </div>

            {payNow && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'pix'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {method === 'cash'
                        ? 'Dinheiro'
                        : method === 'card'
                        ? 'Cartão'
                        : 'PIX'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Submit button */}
        {selectedItems.size > 0 && (
          <Button
            onClick={handleSubmit}
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            {payNow ? 'Criar e Pagar Agora' : 'Criar Comanda'}
          </Button>
        )}
      </div>
    </Layout>
  );
}

// Product button component
function ProductButton({
  product,
  selectedQty,
  onAdd,
}: {
  product: Product;
  selectedQty: number;
  onAdd: () => void;
}) {
  return (
    <button
      onClick={onAdd}
      className={`relative p-4 rounded-lg border-2 transition-all text-left ${
        selectedQty > 0
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-primary-300'
      }`}
    >
      {selectedQty > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {selectedQty}
        </span>
      )}
      <p className="font-medium text-gray-900 mb-1">{product.name}</p>
      <p className="text-sm font-semibold text-primary-600">
        {formatCurrency(product.price)}
      </p>
    </button>
  );
}
