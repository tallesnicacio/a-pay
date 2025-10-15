import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { productsApi } from '../services/api';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyProducts } from '../components/common/EmptyState';
import { SkeletonProductCard } from '../components/common/Skeleton';
import { QRCodeGenerator } from '../components/common/QRCodeGenerator';
import { useToast } from '../components/common/Toast';
import type { Product } from '../types';

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: string;
  active: boolean;
}

export function ProductsPage() {
  const { currentEstablishment, user } = useAuthStore();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: '',
    active: true,
  });

  // Verificar se usuário é owner
  const userRole = user?.roles.find(
    (r) => r.establishmentId === currentEstablishment?.id
  );
  const isOwner = userRole?.role === 'owner' || userRole?.role === 'admin_global';

  // Carregar produtos
  useEffect(() => {
    if (currentEstablishment) {
      fetchProducts();
    }
  }, [currentEstablishment, showInactive]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getProducts({
        active: showInactive ? undefined : true,
        search: searchTerm || undefined,
      });
      setProducts(data);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar produtos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        price: product.price.toString(),
        active: product.active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        price: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      imageUrl: '',
      price: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showToast('Preço inválido', 'error');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category || undefined,
        imageUrl: formData.imageUrl || undefined,
        price,
        active: formData.active,
      };

      if (editingProduct) {
        // Atualizar produto
        await productsApi.updateProduct(editingProduct.id, productData);
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        // Criar produto
        await productsApi.createProduct(productData);
        showToast('Produto criado com sucesso!', 'success');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar produto', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsApi.updateProduct(product.id, {
        active: !product.active,
      });
      showToast(
        `Produto ${!product.active ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
      fetchProducts();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao atualizar produto', 'error');
    }
  };

  const handleDelete = async (product: Product) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      await productsApi.deleteProduct(product.id);
      showToast('Produto excluído com sucesso!', 'success');
      fetchProducts();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao excluir produto', 'error');
    }
  };

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-neutral-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  if (!isOwner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-danger-100 text-danger-600 rounded-2xl mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-danger-600 mb-2 font-display">403</h1>
          <p className="text-neutral-600">
            Apenas o proprietário do estabelecimento pode gerenciar produtos
          </p>
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
            <h2 className="text-3xl font-bold text-neutral-900 font-display">Produtos</h2>
            <p className="text-neutral-500 mt-1">{currentEstablishment.name}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowQRCode(true)}
              variant="secondary"
              size="lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR Code
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              variant="primary"
              size="lg"
              className="shadow-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchProducts();
                }
              }}
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
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchProducts}>
              Buscar
            </Button>
            <label className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              Mostrar inativos
            </label>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && products.length === 0 && (
          <EmptyProducts onCreateProduct={() => handleOpenModal()} />
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                category={product.category}
                image={product.imageUrl}
                price={Number(product.price)}
                isAvailable={product.active}
                onEdit={() => handleOpenModal(product)}
                onDelete={() => handleDelete(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nome"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
            placeholder="Ex: Hambúrguer Artesanal"
          />

          <div className="space-y-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Descrição</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva seu produto"
                className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
              />
            </label>
          </div>

          <Input
            label="Categoria"
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Lanches, Bebidas, Sobremesas"
          />

          <Input
            label="URL da Imagem"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />

          <Input
            label="Preço"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            placeholder="0.00"
            leftIcon={
              <span className="text-neutral-500 font-semibold">R$</span>
            }
          />

          <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-neutral-900">Produto ativo</span>
              <p className="text-xs text-neutral-500 mt-0.5">
                O produto ficará disponível para venda
              </p>
            </div>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        title="Cardápio Digital - QR Code"
        size="lg"
      >
        <QRCodeGenerator
          url={`${window.location.protocol}//${window.location.host}/menu/${currentEstablishment.slug}`}
          title="Cardápio Digital"
          description={`Compartilhe este QR Code para que seus clientes acessem o cardápio de ${currentEstablishment.name}`}
        />
      </Modal>
    </Layout>
  );
}
