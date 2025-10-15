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

  // User Roles (Vincular estabelecimentos)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [managingRolesForUser, setManagingRolesForUser] = useState<UserDetails | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'user'>('user');

  // Form data
  const [formData, setFormData] = useState<any>({});

  // Verificar se é admin_global
  const isAdminGlobal = user?.roles.some((r) => r.role === 'admin_global');

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
        await adminApi.updateEstablishment(
          editingEstablishment.id,
          formData
        );
      } else {
        // Criar
        await adminApi.createEstablishment(
          formData as CreateEstablishmentRequest
        );
      }

      // Recarregar lista completa para garantir dados atualizados
      await loadEstablishments();

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

  // Adicionar role a um usuário
  const handleAddUserRole = async () => {
    if (!managingRolesForUser || !selectedEstablishment || !selectedRole) {
      alert('Selecione um estabelecimento e um cargo');
      return;
    }

    try {
      await adminApi.createUserRole({
        userId: managingRolesForUser.id,
        establishmentId: selectedEstablishment,
        role: selectedRole,
      });

      // Recarregar usuários para atualizar a lista de roles
      await loadUsers();

      // Limpar seleção
      setSelectedEstablishment('');
      setSelectedRole('user');
    } catch (error: any) {
      console.error('Erro ao vincular usuário:', error);
      alert(error.response?.data?.error || 'Erro ao vincular usuário ao estabelecimento');
    }
  };

  // Remover role de um usuário
  const handleRemoveUserRole = async (roleId: string) => {
    if (!confirm('Tem certeza que deseja desvincular?')) return;

    try {
      await adminApi.deleteUserRole(roleId);

      // Recarregar usuários para atualizar a lista de roles
      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao desvincular usuário:', error);
      alert(error.response?.data?.error || 'Erro ao desvincular usuário');
    }
  };

  // Carregar establishments quando abrir modal de roles
  useEffect(() => {
    if (showRoleModal && establishments.length === 0) {
      loadEstablishments();
    }
  }, [showRoleModal]);

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
      <div className="space-y-6 animate-slide-in-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-primary rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white font-display">Administração Global</h2>
              <p className="text-white/90 mt-1">Gerencie estabelecimentos, usuários e permissões do sistema</p>
            </div>
          </div>
        </div>

        {/* Tabs modernizadas */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('establishments')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'establishments'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Estabelecimentos
              {!isLoading && establishments.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'establishments' ? 'bg-white/20' : 'bg-primary-100 text-primary-700'
                }`}>
                  {establishments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
              {!isLoading && users.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'users' ? 'bg-white/20' : 'bg-primary-100 text-primary-700'
                }`}>
                  {users.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        )}

        {/* Establishments Tab */}
        {!isLoading && activeTab === 'establishments' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-display">
                  Estabelecimentos Cadastrados
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {establishments.length} {establishments.length === 1 ? 'estabelecimento' : 'estabelecimentos'} no sistema
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingEstablishment(null);
                  setFormData({
                    name: '',
                    slug: '',
                    hasKitchen: true,
                    hasOrders: true,
                    hasReports: true,
                    active: true,
                  });
                  setShowEstablishmentModal(true);
                }}
                variant="primary"
                size="lg"
                className="shadow-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Estabelecimento
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {establishments.map((establishment) => (
                <Card key={establishment.id} className="hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-neutral-900 font-display truncate">
                          {establishment.name}
                        </h3>
                        <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          /{establishment.slug}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          establishment.active
                            ? 'bg-success-100 text-success-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {establishment.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {/* Módulos */}
                    <div className="flex flex-wrap items-center gap-2">
                      {establishment.hasOrders && (
                        <span className="px-3 py-1.5 bg-info-100 text-info-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Comandas
                        </span>
                      )}
                      {establishment.hasKitchen && (
                        <span className="px-3 py-1.5 bg-warning-100 text-warning-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          Cozinha
                        </span>
                      )}
                      {establishment.hasReports && (
                        <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Relatórios
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    {establishment._count && (
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-600 font-display">{establishment._count.userRoles}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Usuários</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-600 font-display">{establishment._count.products}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Produtos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-600 font-display">{establishment._count.orders}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">Pedidos</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setEditingEstablishment(establishment);
                          setFormData({
                            name: establishment.name,
                            slug: establishment.slug,
                            hasKitchen: establishment.hasKitchen,
                            hasOrders: establishment.hasOrders,
                            hasReports: establishment.hasReports,
                            active: establishment.active,
                          });
                          setShowEstablishmentModal(true);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEstablishment(establishment.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-display">
                  Usuários do Sistema
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
                </p>
              </div>
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
                variant="primary"
                size="lg"
                className="shadow-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Usuário
              </Button>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-neutral-900 font-display">{user.name}</h3>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                user.active
                                  ? 'bg-success-100 text-success-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {user.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Roles */}
                      {user.userRoles && user.userRoles.length > 0 && (
                        <div className="mt-3 pl-15">
                          <p className="text-xs font-medium text-neutral-500 mb-2">Vínculos:</p>
                          <div className="flex flex-wrap gap-2">
                            {user.userRoles.map((role) => (
                              <span
                                key={role.id}
                                className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-lg font-medium border border-primary-200 flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-semibold">{role.role === 'owner' ? 'Proprietário' : role.role === 'user' ? 'Funcionário' : role.role}</span>
                                <span className="opacity-60">em</span>
                                <span>{role.establishment?.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0 lg:flex-col">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setManagingRolesForUser(user);
                          setShowRoleModal(true);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Vincular
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                id="active"
                checked={formData.active !== false}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
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
            {!editingUser && (
              <Input
                label="Senha"
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                required
              />
            )}


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

        {/* Modal de Vincular Usuário a Estabelecimento */}
        <Modal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setManagingRolesForUser(null);
            setSelectedEstablishment('');
            setSelectedRole('user');
          }}
          title={`Vincular ${managingRolesForUser?.name || 'Usuário'} a Estabelecimentos`}
        >
          <div className="space-y-4">
            {/* Lista de vínculos atuais */}
            {managingRolesForUser?.userRoles && managingRolesForUser.userRoles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Vínculos atuais:</p>
                {managingRolesForUser.userRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {role.establishment?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cargo: {role.role === 'owner' ? 'Proprietário' : 'Funcionário'}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveUserRole(role.id)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário para adicionar novo vínculo */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Adicionar novo vínculo:</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estabelecimento
                </label>
                <select
                  value={selectedEstablishment}
                  onChange={(e) => setSelectedEstablishment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um estabelecimento</option>
                  {establishments.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'owner' | 'user')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">Funcionário</option>
                  <option value="owner">Proprietário</option>
                </select>
              </div>

              <Button onClick={handleAddUserRole} fullWidth>
                Adicionar Vínculo
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setManagingRolesForUser(null);
                  setSelectedEstablishment('');
                  setSelectedRole('user');
                }}
                fullWidth
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
