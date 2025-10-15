import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export function SelectEstablishmentPage() {
  const { user, currentEstablishment, setCurrentEstablishment, logout } = useAuthStore();
  const navigate = useNavigate();

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

  if (!user) {
    return null;
  }

  // Filtrar apenas roles com estabelecimento
  const establishmentRoles = user.roles.filter(r => r.establishmentId !== null);

  // Se não tem estabelecimentos, mostrar mensagem
  if (establishmentRoles.length === 0) {
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
              Você não está vinculado a nenhum estabelecimento. Entre em contato com o administrador.
            </p>
            <Button variant="outline" onClick={logout} fullWidth>
              Sair
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Se tem apenas um estabelecimento, selecionar automaticamente
  if (establishmentRoles.length === 1 && establishmentRoles[0].establishmentId) {
    const role = establishmentRoles[0];
    setCurrentEstablishment({
      id: role.establishmentId,
      name: role.establishmentName || 'Estabelecimento',
      slug: role.establishmentSlug || '',
      role: role.role,
      hasKitchen: role.hasKitchen,
      hasOrders: role.hasOrders,
      hasReports: role.hasReports,
      onlineOrdering: role.onlineOrdering,
      active: role.active,
    });
    return null;
  }

  const handleSelectEstablishment = (role: typeof establishmentRoles[0]) => {
    if (role.establishmentId) {
      setCurrentEstablishment({
        id: role.establishmentId,
        name: role.establishmentName || 'Estabelecimento',
        slug: role.establishmentSlug || '',
        role: role.role,
        hasKitchen: role.hasKitchen,
        hasOrders: role.hasOrders,
        hasReports: role.hasReports,
        onlineOrdering: role.onlineOrdering,
        active: role.active,
      });
      navigate('/dashboard', { replace: true });
    }
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
            Selecione o Estabelecimento
          </h1>
          <p className="text-neutral-600">
            Olá, <span className="font-semibold">{user.name}</span>! Escolha o estabelecimento para acessar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {establishmentRoles.map((role) => (
            <Card
              key={role.id}
              padding="lg"
              className="shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
              onClick={() => handleSelectEstablishment(role)}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      {role.establishmentName || 'Sem nome'}
                    </h3>
                    {role.establishmentSlug && (
                      <p className="text-sm text-neutral-500">
                        @{role.establishmentSlug}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <Badge
                    variant={role.role === 'owner' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {role.role === 'owner' ? 'Proprietário' : role.role === 'user' ? 'Funcionário' : role.role}
                  </Badge>

                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
