import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { productsApi } from '../services/api';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import type { Product } from '../types';

interface ProductFormData {
  name: string;
  price: string;
  active: boolean;
}

export function ProductsPage() {
  const { currentEstablishment, user } = useAuthStore();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
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
        price: product.price.toString(),
        active: product.active,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
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
      if (editingProduct) {
        // Atualizar produto
        await productsApi.updateProduct(editingProduct.id, {
          name: formData.name,
          price,
          active: formData.active,
        });
        showToast('Produto atualizado com sucesso!', 'success');
      } else {
        // Criar produto
        await productsApi.createProduct({
          name: formData.name,
          price,
          active: formData.active,
        });
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
          <p className="text-gray-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  if (!isOwner) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
          <p className="text-gray-600">
            Apenas o proprietário do estabelecimento pode gerenciar produtos
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
            <p className="text-sm text-gray-600">{currentEstablishment.name}</p>
          </div>

          <Button onClick={() => handleOpenModal()}>+ Novo Produto</Button>
        </div>

        {/* Filtros */}
        <Card>
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
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={fetchProducts}>
                Buscar
              </Button>
              <label className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                Mostrar inativos
              </label>
            </div>
          </div>
        </Card>

        {/* Lista de Produtos */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum produto encontrado</p>
              <Button className="mt-4" onClick={() => handleOpenModal()}>
                Criar primeiro produto
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} padding="sm">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                      R$ {Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      {product.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />

              <Input
                label="Preço"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Produto ativo</span>
              </label>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={handleCloseModal} fullWidth>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth>
                  {editingProduct ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
