import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import type { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
}

export function MenuPage() {
  const { establishmentSlug } = useParams<{ establishmentSlug: string }>();
  const { showToast } = useToast();

  const [establishment, setEstablishment] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tableCode, setTableCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadMenu();
  }, [establishmentSlug]);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/public/menu/${establishmentSlug}`
      );

      if (!response.ok) {
        throw new Error('Cardápio não encontrado');
      }

      const data = await response.json();
      setEstablishment(data.data.establishment);
      setProducts(data.data.products);
    } catch (error) {
      showToast('Erro ao carregar cardápio', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    showToast(`${product.name} adicionado ao carrinho`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const updateNote = (productId: string, note: string) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, note }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) =>
      sum + (Number(item.product.price) * item.quantity), 0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      showToast('Por favor, informe seu nome', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Adicione produtos ao carrinho', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/public/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            establishmentSlug,
            code: tableCode || `Cliente-${Date.now()}`,
            customerName,
            items: cart.map(item => ({
              productId: item.product.id,
              qty: item.quantity,
              note: item.note,
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar pedido');
      }

      showToast('Pedido enviado com sucesso!', 'success', 'Aguarde :)');
      setCart([]);
      setTableCode('');
      setCustomerName('');
      setShowCheckout(false);
    } catch (error: any) {
      showToast(error.message || 'Erro ao enviar pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Cardápio não encontrado</h2>
          <p className="text-neutral-600">Verifique o QR Code ou entre em contato com o estabelecimento.</p>
        </Card>
      </div>
    );
  }

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-bg pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-display">
                {establishment.name}
              </h1>
              <p className="text-sm text-neutral-600">Cardápio Digital</p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category!)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {products
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
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
                      R$ {Number(product.price).toFixed(2)}
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
                    onClick={() => addToCart(product)}
                  >
                    <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600">Nenhum produto disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Seu Pedido"
      >
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">Seu carrinho está vazio</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex gap-3 pb-4 border-b">
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900">{item.product.name}</h4>
                  <p className="text-sm text-neutral-600">
                    R$ {Number(item.product.price).toFixed(2)}
                  </p>
                  <Input
                    type="text"
                    placeholder="Observações (opcional)"
                    value={item.note || ''}
                    onChange={(e) => updateNote(item.product.id, e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-8 h-8 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t-2">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-2xl text-primary-600">
                  R$ {getTotalAmount().toFixed(2)}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
              >
                Finalizar Pedido
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="Finalizar Pedido"
      >
        <div className="space-y-4">
          <Input
            type="text"
            label="Seu Nome *"
            placeholder="Ex: João Silva"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <Input
            type="text"
            label="Número da Mesa (opcional)"
            placeholder="Ex: Mesa 5"
            value={tableCode}
            onChange={(e) => setTableCode(e.target.value)}
          />

          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600 mb-2">Resumo do Pedido:</p>
            <div className="space-y-1">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-medium">
                    R$ {(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
              <span>Total:</span>
              <span className="text-primary-600">R$ {getTotalAmount().toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmitOrder}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
          </Button>

          <p className="text-xs text-neutral-500 text-center">
            Ao confirmar, seu pedido será enviado para a cozinha
          </p>
        </div>
      </Modal>
    </div>
  );
}
