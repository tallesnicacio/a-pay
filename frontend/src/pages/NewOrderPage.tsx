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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

// Product card component
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-[1.02] relative">
      {selectedQty > 0 && (
        <span className="absolute top-3 right-3 z-10 w-8 h-8 bg-primary-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
          {selectedQty}
        </span>
      )}

      <div className="relative">
        {product.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <svg className="w-20 h-20 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-neutral-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
              {product.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-lg text-neutral-900 font-display leading-tight">
            {product.name}
          </h3>
          <span className="text-xl font-bold text-primary-600 flex-shrink-0 whitespace-nowrap">
            {formatCurrency(product.price)}
          </span>
        </div>
        {product.description ? (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        ) : (
          <div className="mb-3"></div>
        )}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAdd}
        >
          <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar
        </Button>
      </div>
    </Card>
  );
}
