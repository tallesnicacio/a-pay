import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentEstablishment, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Estabelecimento */}
            <div>
              <h1 className="text-xl font-bold text-primary-900">A-Pay</h1>
              {currentEstablishment && (
                <p className="text-xs text-gray-600">
                  {currentEstablishment.name}
                </p>
              )}
            </div>

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sair"
              >
                <svg
                  className="w-6 h-6"
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

      {/* Navigation tabs (visible on all screens) */}
      <nav className="bg-white border-b border-gray-200 sticky top-[65px] z-30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => navigate('/orders')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive('/orders')
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📋 Comandas
            </button>

            {currentEstablishment?.hasKitchen !== false && (
              <button
                onClick={() => navigate('/kitchen')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive('/kitchen')
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                🍳 Cozinha
              </button>
            )}

            <button
              onClick={() => navigate('/reports')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive('/reports')
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              📊 Relatórios
            </button>

            {user?.establishments?.some((e: any) => e.role === 'admin_global' || e.role === 'admin') && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive('/admin')
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                ⚙️ Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0 sm:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 flex flex-col items-center py-3 text-gray-600 hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-xs mt-1">Comandas</span>
          </button>

          <button
            onClick={() => navigate('/kitchen')}
            className="flex-1 flex flex-col items-center py-3 text-gray-600 hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-xs mt-1">Cozinha</span>
          </button>

          <button
            onClick={() => navigate('/orders/new')}
            className="flex-1 flex flex-col items-center py-3 text-gray-600 hover:bg-gray-50"
          >
            <div className="w-12 h-12 -mt-6 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-xs mt-1">Nova</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="flex-1 flex flex-col items-center py-3 text-gray-600 hover:bg-gray-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs mt-1">Relatórios</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
