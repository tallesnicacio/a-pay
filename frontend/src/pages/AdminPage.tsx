import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { adminApi } from '../services/api';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import type {
  EstablishmentDetails,
  UserDetails,
  CreateEstablishmentRequest,
  CreateUserRequest,
} from '../types';

type Tab = 'establishments' | 'users';

export function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('establishments');
  const [isLoading, setIsLoading] = useState(false);

  // Establishments
  const [establishments, setEstablishments] = useState<EstablishmentDetails[]>([]);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [editingEstablishment, setEditingEstablishment] =
    useState<EstablishmentDetails | null>(null);

  // Users
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);

  // Form data
  const [formData, setFormData] = useState<any>({});

  // Verificar se é admin_global
  const isAdminGlobal = user?.establishments.some((e) => e.role === 'admin_global');

  // Carregar establishments
  const loadEstablishments = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.listEstablishments();
      setEstablishments(response.data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.listUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Criar/Atualizar establishment
  const handleSaveEstablishment = async () => {
    try {
      if (editingEstablishment) {
        // Atualizar
        const updated = await adminApi.updateEstablishment(
          editingEstablishment.id,
          formData
        );
        setEstablishments(
          establishments.map((e) => (e.id === updated.id ? updated : e))
        );
      } else {
        // Criar
        const created = await adminApi.createEstablishment(
          formData as CreateEstablishmentRequest
        );
        setEstablishments([created, ...establishments]);
      }
      setShowEstablishmentModal(false);
      setEditingEstablishment(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
      alert('Erro ao salvar estabelecimento');
    }
  };

  // Deletar establishment
  const handleDeleteEstablishment = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este estabelecimento?')) return;

    try {
      await adminApi.deleteEstablishment(id);
      setEstablishments(establishments.filter((e) => e.id !== id));
    } catch (error: any) {
      console.error('Erro ao deletar estabelecimento:', error);
      alert(error.response?.data?.error || 'Erro ao deletar estabelecimento');
    }
  };

  // Criar/Atualizar user
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Atualizar
        const updated = await adminApi.updateUser(editingUser.id, formData);
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      } else {
        // Criar
        const created = await adminApi.createUser(formData as CreateUserRequest);
        setUsers([created, ...users]);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    }
  };

  // Deletar user
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      alert(error.response?.data?.error || 'Erro ao deletar usuário');
    }
  };

  // Carregar dados ao mudar tab
  useEffect(() => {
    if (activeTab === 'establishments') {
      loadEstablishments();
    } else {
      loadUsers();
    }
  }, [activeTab]);

  if (!isAdminGlobal) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você precisa ser admin_global para acessar esta página
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administração</h2>
          <p className="text-sm text-gray-600">
            Gerencie estabelecimentos e usuários
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('establishments')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'establishments'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Estabelecimentos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Usuários
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        )}

        {/* Establishments Tab */}
        {!isLoading && activeTab === 'establishments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {establishments.length} estabelecimentos
              </p>
              <Button
                onClick={() => {
                  setEditingEstablishment(null);
                  setFormData({
                    name: '',
                    slug: '',
                    hasKitchen: true,
                    hasOrders: true,
                    hasReports: true,
                    isActive: true,
                  });
                  setShowEstablishmentModal(true);
                }}
              >
                + Novo Estabelecimento
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {establishments.map((establishment) => (
                <Card key={establishment.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {establishment.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          /{establishment.slug}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          establishment.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {establishment.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {establishment.hasOrders && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          📋 Comandas
                        </span>
                      )}
                      {establishment.hasKitchen && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                          🍳 Cozinha
                        </span>
                      )}
                      {establishment.hasReports && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          📊 Relatórios
                        </span>
                      )}
                    </div>

                    {establishment._count && (
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{establishment._count.users} usuários</span>
                        <span>{establishment._count.products} produtos</span>
                        <span>{establishment._count.orders} pedidos</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEstablishment(establishment);
                          setFormData({
                            name: establishment.name,
                            slug: establishment.slug,
                            hasKitchen: establishment.hasKitchen,
                            hasOrders: establishment.hasOrders,
                            hasReports: establishment.hasReports,
                            isActive: establishment.isActive,
                          });
                          setShowEstablishmentModal(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEstablishment(establishment.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {!isLoading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{users.length} usuários</p>
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setFormData({
                    name: '',
                    email: '',
                    active: true,
                  });
                  setShowUserModal(true);
                }}
              >
                + Novo Usuário
              </Button>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>

                      {user.userRoles && user.userRoles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {user.userRoles.map((role) => (
                            <span
                              key={role.id}
                              className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
                            >
                              {role.role} @ {role.establishment?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            active: user.active,
                          });
                          setShowUserModal(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Establishment */}
        <Modal
          isOpen={showEstablishmentModal}
          onClose={() => {
            setShowEstablishmentModal(false);
            setEditingEstablishment(null);
            setFormData({});
          }}
          title={
            editingEstablishment
              ? 'Editar Estabelecimento'
              : 'Novo Estabelecimento'
          }
        >
          <div className="space-y-4">
            <Input
              label="Nome"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Churrasquinho da Praça"
            />

            <Input
              label="Slug"
              value={formData.slug || ''}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase() })
              }
              placeholder="Ex: churrasquinho-praca"
            />

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700">Módulos disponíveis:</p>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasOrders"
                  checked={formData.hasOrders !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasOrders: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="hasOrders" className="text-sm text-gray-700">
                  📋 Módulo de Comandas
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasKitchen"
                  checked={formData.hasKitchen !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasKitchen: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="hasKitchen" className="text-sm text-gray-700">
                  🍳 Módulo de Cozinha
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasReports"
                  checked={formData.hasReports !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, hasReports: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="hasReports" className="text-sm text-gray-700">
                  📊 Módulo de Relatórios
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-gray-200 pt-4">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive !== false}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                ✅ Estabelecimento ativo
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEstablishment} className="flex-1">
                {editingEstablishment ? 'Atualizar' : 'Criar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEstablishmentModal(false);
                  setEditingEstablishment(null);
                  setFormData({});
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de User */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
            setFormData({});
          }}
          title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        >
          <div className="space-y-4">
            <Input
              label="Nome"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João Silva"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ex: joao@example.com"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="userActive"
                checked={formData.active !== false}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="userActive" className="text-sm text-gray-700">
                Usuário ativo
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveUser} className="flex-1">
                {editingUser ? 'Atualizar' : 'Criar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setFormData({});
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
