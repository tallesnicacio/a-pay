import { useState, useEffect } from 'react';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';
import { employeesApi } from '../services/api';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types';
import { useAuthStore } from '../stores/authStore';

export function EmployeesPage() {
  const { currentEstablishment, user } = useAuthStore();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<CreateEmployeeRequest>>({
    email: '',
    name: '',
    password: '',
    role: 'user',
    permissions: {
      modules: {
        orders: true,
        kitchen: false,
        reports: false,
      },
    },
  });

  // Check if user is owner
  const userRole = user?.roles.find(r => r.establishmentId === currentEstablishment?.id);
  const isOwner = userRole?.role === 'owner' || userRole?.role === 'admin_global';

  useEffect(() => {
    if (!isOwner) return;
    loadEmployees();
  }, [isOwner]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeesApi.listEmployees();
      setEmployees(data);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao carregar funcionários', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        permissions: employee.permissions || {
          modules: {
            orders: true,
            kitchen: false,
            reports: false,
          },
        },
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'user',
        permissions: {
          modules: {
            orders: true,
            kitchen: false,
            reports: false,
          },
        },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        // Update
        const updateData: UpdateEmployeeRequest = {
          name: formData.name,
          email: formData.email,
          permissions: formData.permissions,
        };
        await employeesApi.updateEmployee(editingEmployee.id, updateData);
        showToast('Funcionário atualizado com sucesso', 'success');
      } else {
        // Create
        if (!formData.email || !formData.name || !formData.password) {
          showToast('Preencha todos os campos obrigatórios', 'error');
          return;
        }

        const createData: CreateEmployeeRequest = {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role || 'user',
          permissions: formData.permissions,
        };

        await employeesApi.createEmployee(createData);
        showToast('Funcionário criado com sucesso', 'success');
      }

      handleCloseModal();
      loadEmployees();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao salvar funcionário', 'error');
    }
  };

  const handleToggleActive = async (employee: Employee) => {
    try {
      await employeesApi.updateEmployee(employee.id, {
        active: !employee.active,
      });
      showToast(
        `Funcionário ${employee.active ? 'desativado' : 'ativado'} com sucesso`,
        'success'
      );
      loadEmployees();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao atualizar status', 'error');
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Tem certeza que deseja remover ${employee.name}?`)) {
      return;
    }

    try {
      await employeesApi.deleteEmployee(employee.id);
      showToast('Funcionário removido com sucesso', 'success');
      loadEmployees();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Erro ao remover funcionário', 'error');
    }
  };

  if (!isOwner) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Apenas o proprietário pode gerenciar funcionários
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <Button onClick={() => handleOpenModal()}>
            + Novo Funcionário
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Nenhum funcionário cadastrado</p>
            <Button
              onClick={() => handleOpenModal()}
              variant="secondary"
              className="mt-4"
            >
              Cadastrar primeiro funcionário
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.role === 'owner'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {employee.role === 'owner' ? 'Proprietário' : 'Funcionário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {employee.role === 'user' && employee.permissions ? (
                        <div className="text-xs text-gray-600 space-y-1">
                          {employee.permissions.modules.orders && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Pedidos
                            </div>
                          )}
                          {employee.permissions.modules.kitchen && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Cozinha
                            </div>
                          )}
                          {employee.permissions.modules.reports && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Relatórios
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Todas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {employee.role !== 'owner' && (
                        <>
                          <button
                            onClick={() => handleOpenModal(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(employee)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {employee.active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => handleDelete(employee)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            {!editingEmployee && (
              <>
                <Input
                  label="Senha"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função
                  </label>
                  <select
                    value={formData.role || 'user'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Funcionário</option>
                    <option value="owner">Proprietário</option>
                  </select>
                </div>
              </>
            )}

            {(formData.role === 'user' || (editingEmployee && editingEmployee.role === 'user')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissões
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.modules.orders || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            modules: {
                              ...formData.permissions?.modules,
                              orders: e.target.checked,
                              kitchen: formData.permissions?.modules.kitchen || false,
                              reports: formData.permissions?.modules.reports || false,
                            },
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pedidos</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.modules.kitchen || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            modules: {
                              orders: formData.permissions?.modules.orders || false,
                              kitchen: e.target.checked,
                              reports: formData.permissions?.modules.reports || false,
                            },
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cozinha</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.modules.reports || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            modules: {
                              orders: formData.permissions?.modules.orders || false,
                              kitchen: formData.permissions?.modules.kitchen || false,
                              reports: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Relatórios</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
