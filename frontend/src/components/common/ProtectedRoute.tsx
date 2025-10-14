import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin_global' | 'owner' | 'user';
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, verifyAuth, accessToken, user, currentEstablishment } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Só verifica auth se não estiver autenticado mas tiver token
    if (!isAuthenticated && accessToken) {
      verifyAuth();
    }
  }, [isAuthenticated, accessToken, verifyAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role se necessário
  if (requireRole && user) {
    // admin_global tem acesso a tudo
    const isAdminGlobal = user.roles.some(r => r.role === 'admin_global');

    if (isAdminGlobal) {
      return <>{children}</>;
    }

    // Para outros roles, verificar no estabelecimento atual
    if (currentEstablishment) {
      const userRoleInEstablishment = user.roles.find(
        r => r.establishmentId === currentEstablishment.id
      );

      const hasRequiredRole = userRoleInEstablishment?.role === requireRole ||
                             (requireRole === 'user' && userRoleInEstablishment?.role === 'owner');

      if (!hasRequiredRole) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
              <p className="text-gray-600">Você não tem permissão para acessar esta página</p>
              <p className="text-sm text-gray-500 mt-2">
                Role necessária: {requireRole}
              </p>
            </div>
          </div>
        );
      }
    } else {
      // Sem estabelecimento selecionado
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-600 mb-2">⚠️</h1>
            <p className="text-gray-600">Nenhum estabelecimento selecionado</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
