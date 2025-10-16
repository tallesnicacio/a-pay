import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import type { EstablishmentDetails } from '../types';

export function SelectEstablishmentPage() {
  const { user, currentEstablishment, setCurrentEstablishment, logout } = useAuthStore();
  const navigate = useNavigate();
  const [allEstablishments, setAllEstablishments] = useState<EstablishmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se é admin global
  const isAdminGlobal = user?.roles?.some(r => r.role === 'admin_global');

  // Se já tem estabelecimento selecionado, redirecionar
  useEffect(() => {
    if (currentEstablishment) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentEstablishment, navigate]);

  // Se não tem usuário, redirecionar para login
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Buscar todos os estabelecimentos se for admin global
  useEffect(() => {
    async function fetchAllEstablishments() {
      if (!isAdminGlobal) return;

      setIsLoading(true);
      try {
        const response = await api.admin.listEstablishments({});
        setAllEstablishments(response.establishments);
      } catch (error) {
        console.error('Erro ao buscar estabelecimentos:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAdminGlobal) {
      fetchAllEstablishments();
    }
  }, [isAdminGlobal]);

  if (!user) {
    return null;
  }

  // Preparar lista de estabelecimentos
  let establishments: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
    hasKitchen?: boolean;
    hasOrders?: boolean;
    hasReports?: boolean;
    onlineOrdering?: boolean;
    active?: boolean;
  }> = [];

  if (isAdminGlobal) {
    // Admin global vê todos os estabelecimentos
    establishments = allEstablishments.map(est => ({
      id: est.id,
      name: est.name,
      slug: est.slug,
      role: 'admin_global',
      hasKitchen: est.hasKitchen,
      hasOrders: est.hasOrders,
      hasReports: est.hasReports,
      onlineOrdering: est.onlineOrdering,
      active: est.active,
    }));
  } else {
    // Filtrar apenas roles com estabelecimento
    const establishmentRoles = user.roles.filter(r => r.establishmentId !== null);
    establishments = establishmentRoles.map(role => ({
      id: role.establishmentId!,
      name: role.establishmentName || 'Sem nome',
      slug: role.establishmentSlug || '',
      role: role.role,
      hasKitchen: role.hasKitchen,
      hasOrders: role.hasOrders,
      hasReports: role.hasReports,
      onlineOrdering: role.onlineOrdering,
      active: role.active,
    }));
  }

  // Loading state para admin global
  if (isAdminGlobal && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-neutral-600">Carregando estabelecimentos...</p>
        </div>
      </div>
    );
  }

  // Se não tem estabelecimentos, mostrar mensagem
  if (establishments.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
        <Card padding="lg" className="max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Nenhum Estabelecimento
            </h2>
            <p className="text-neutral-600 mb-6">
              {isAdminGlobal
                ? 'Nenhum estabelecimento cadastrado no sistema.'
                : 'Você não está vinculado a nenhum estabelecimento. Entre em contato com o administrador.'}
            </p>
            <Button variant="outline" onClick={logout} fullWidth>
              Sair
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Se tem apenas um estabelecimento e não é admin, selecionar automaticamente
  if (establishments.length === 1 && !isAdminGlobal) {
    const establishment = establishments[0];
    setCurrentEstablishment(establishment);
    return null;
  }

  const handleSelectEstablishment = (establishment: typeof establishments[0]) => {
    setCurrentEstablishment(establishment);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl shadow-primary mb-4">
            <span className="text-white font-bold text-3xl font-display">A</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2 font-display">
            {isAdminGlobal ? 'Escolha o Estabelecimento' : 'Selecione o Estabelecimento'}
          </h1>
          <p className="text-neutral-600">
            Olá, <span className="font-semibold">{user.name}</span>!{' '}
            {isAdminGlobal
              ? 'Como admin global, você pode acessar qualquer estabelecimento.'
              : 'Escolha o estabelecimento para acessar.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {establishments.map((establishment) => (
            <Card
              key={establishment.id}
              padding="lg"
              className="shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
              onClick={() => handleSelectEstablishment(establishment)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      {establishment.name}
                    </h3>
                    {establishment.slug && (
                      <p className="text-sm text-neutral-500">
                        @{establishment.slug}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Indicadores de módulos */}
                  {(establishment.hasKitchen || establishment.hasOrders || establishment.hasReports) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {establishment.hasOrders && (
                        <div className="flex items-center gap-1 text-xs text-neutral-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Comandas
                        </div>
                      )}
                      {establishment.hasKitchen && (
                        <div className="flex items-center gap-1 text-xs text-neutral-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          Cozinha
                        </div>
                      )}
                      {establishment.hasReports && (
                        <div className="flex items-center gap-1 text-xs text-neutral-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          Relatórios
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <Badge
                      variant={
                        establishment.role === 'admin_global'
                          ? 'primary'
                          : establishment.role === 'owner'
                            ? 'success'
                            : 'secondary'
                      }
                      size="sm"
                    >
                      {establishment.role === 'admin_global'
                        ? 'Admin Global'
                        : establishment.role === 'owner'
                          ? 'Proprietário'
                          : 'Funcionário'}
                    </Badge>

                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" size="sm" onClick={logout}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            © 2025 A-Pay. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
