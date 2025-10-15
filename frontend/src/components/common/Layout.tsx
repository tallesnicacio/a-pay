import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useNotifications } from '../../hooks/useNotifications';
import clsx from 'clsx';
import { Badge } from './Badge';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentEstablishment, logout } = useAuthStore();

  // Conectar ao SSE de notificações
  useNotifications({
    enabled: !!currentEstablishment,
    onNotification: (notification) => {
      // Callback quando receber notificação de novo pedido
      if (notification.type === 'new_order' && location.pathname === '/orders') {
        // Atualizar lista de pedidos se estiver na página de comandas
        window.location.reload();
      }
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Verificar permissões do usuário
  const userRole = user?.roles?.find((r) => r.establishmentId === currentEstablishment?.id);
  const isAdminGlobal = user?.roles?.some((r) => r.role === 'admin_global');
  const isOwner = userRole?.role === 'owner' || isAdminGlobal;
  const isUser = userRole?.role === 'user';

  // Permissões de módulos para usuários
  // Admin global sempre tem acesso total, mesmo sem estabelecimento selecionado
  // Verificar tanto as permissões do usuário quanto se o estabelecimento tem o módulo habilitado
  const hasOrdersAccess = isAdminGlobal || (currentEstablishment && currentEstablishment.hasOrders !== false && (isOwner || (isUser && userRole?.permissions?.modules?.orders)));
  const hasKitchenAccess = isAdminGlobal || (currentEstablishment && currentEstablishment.hasKitchen === true && (isOwner || (isUser && userRole?.permissions?.modules?.kitchen)));
  const hasReportsAccess = isAdminGlobal || (currentEstablishment && currentEstablishment.hasReports !== false && (isOwner || (isUser && userRole?.permissions?.modules?.reports)));
  const hasProductsAccess = isAdminGlobal || (currentEstablishment && isOwner);
  const hasEmployeesAccess = isAdminGlobal || (currentEstablishment && isOwner);

  return (
    <div className="min-h-screen bg-gradient-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Estabelecimento */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                <span className="text-white font-bold text-lg font-display">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 font-display">A-Pay</h1>
                {currentEstablishment && (
                  <p className="text-xs text-neutral-500">
                    {currentEstablishment.name}
                  </p>
                )}
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.name}
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                  {isAdminGlobal && (
                    <Badge variant="primary" size="sm">
                      Admin
                    </Badge>
                  )}
                  {isOwner && !isAdminGlobal && (
                    <Badge variant="success" size="sm">
                      Owner
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all active:scale-95"
                title="Sair"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs (visible on desktop) */}
      <nav className="bg-white border-b-2 border-neutral-200 sticky top-[73px] z-30 hidden sm:block shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className={clsx(
                'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                {
                  'text-primary-600 border-primary-600 bg-primary-50': isActive('/dashboard'),
                  'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                    !isActive('/dashboard'),
                }
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </button>

            {hasOrdersAccess && (
              <button
                onClick={() => navigate('/orders')}
                className={clsx(
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                  {
                    'text-primary-600 border-primary-600 bg-primary-50': isActive('/orders'),
                    'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                      !isActive('/orders'),
                  }
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Comandas
              </button>
            )}

            {hasKitchenAccess && (
              <button
                onClick={() => navigate('/kitchen')}
                className={clsx(
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                  {
                    'text-primary-600 border-primary-600 bg-primary-50': isActive('/kitchen'),
                    'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                      !isActive('/kitchen'),
                  }
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Cozinha
              </button>
            )}

            {hasReportsAccess && (
              <button
                onClick={() => navigate('/reports')}
                className={clsx(
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                  {
                    'text-primary-600 border-primary-600 bg-primary-50': isActive('/reports'),
                    'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                      !isActive('/reports'),
                  }
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Relatórios
              </button>
            )}

            {hasProductsAccess && (
              <button
                onClick={() => navigate('/products')}
                className={clsx(
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                  {
                    'text-primary-600 border-primary-600 bg-primary-50': isActive('/products'),
                    'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                      !isActive('/products'),
                  }
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Produtos
              </button>
            )}

            {hasEmployeesAccess && (
              <button
                onClick={() => navigate('/employees')}
                className={clsx(
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-4 flex items-center gap-2',
                  {
                    'text-primary-600 border-primary-600 bg-primary-50': isActive('/employees'),
                    'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300 hover:bg-neutral-50':
                      !isActive('/employees'),
                  }
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Funcionários
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-6">
        <div className="container mx-auto px-4 py-6 max-w-7xl animate-slide-in-up">
          {children}
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="bg-white border-t-2 border-neutral-200 sticky bottom-0 sm:hidden shadow-lg z-40">
        <div className="flex items-center justify-around">
          {hasOrdersAccess && (
            <button
              onClick={() => navigate('/orders')}
              className={clsx(
                'flex-1 flex flex-col items-center py-3 transition-all',
                {
                  'text-primary-600 bg-primary-50': isActive('/orders'),
                  'text-neutral-600 hover:bg-neutral-50 active:scale-95': !isActive('/orders'),
                }
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isActive('/orders') ? 2.5 : 2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className={clsx('text-xs mt-1', { 'font-semibold': isActive('/orders') })}>
                Comandas
              </span>
            </button>
          )}

          {hasKitchenAccess && (
            <button
              onClick={() => navigate('/kitchen')}
              className={clsx(
                'flex-1 flex flex-col items-center py-3 transition-all',
                {
                  'text-primary-600 bg-primary-50': isActive('/kitchen'),
                  'text-neutral-600 hover:bg-neutral-50 active:scale-95': !isActive('/kitchen'),
                }
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isActive('/kitchen') ? 2.5 : 2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className={clsx('text-xs mt-1', { 'font-semibold': isActive('/kitchen') })}>
                Cozinha
              </span>
            </button>
          )}

          {hasOrdersAccess && (
            <button
              onClick={() => navigate('/orders/new')}
              className="flex-1 flex flex-col items-center py-3 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 -mt-7 bg-gradient-primary text-white rounded-full flex items-center justify-center shadow-primary">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1 font-semibold text-neutral-600">Nova</span>
            </button>
          )}

          {hasReportsAccess && (
            <button
              onClick={() => navigate('/reports')}
              className={clsx(
                'flex-1 flex flex-col items-center py-3 transition-all',
                {
                  'text-primary-600 bg-primary-50': isActive('/reports'),
                  'text-neutral-600 hover:bg-neutral-50 active:scale-95': !isActive('/reports'),
                }
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={isActive('/reports') ? 2.5 : 2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className={clsx('text-xs mt-1', { 'font-semibold': isActive('/reports') })}>
                Relatórios
              </span>
            </button>
          )}

          {(hasProductsAccess || hasEmployeesAccess) && (
            <button
              onClick={() => navigate(hasProductsAccess ? '/products' : '/employees')}
              className={clsx(
                'flex-1 flex flex-col items-center py-3 transition-all',
                {
                  'text-primary-600 bg-primary-50':
                    isActive('/products') || isActive('/employees'),
                  'text-neutral-600 hover:bg-neutral-50 active:scale-95':
                    !isActive('/products') && !isActive('/employees'),
                }
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={
                    isActive('/products') || isActive('/employees') ? 2.5 : 2
                  }
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={
                    isActive('/products') || isActive('/employees') ? 2.5 : 2
                  }
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span
                className={clsx('text-xs mt-1', {
                  'font-semibold': isActive('/products') || isActive('/employees'),
                })}
              >
                Gestão
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
