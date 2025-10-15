import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SelectEstablishmentPage } from './pages/SelectEstablishmentPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { KitchenPage } from './pages/KitchenPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProductsPage } from './pages/ProductsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AdminPage } from './pages/AdminPage';
import { MenuPage } from './pages/MenuPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toast, useToast } from './components/common/Toast';
import { RetryQueueIndicator } from './components/common/RetryQueueIndicator';
import { Layout } from './components/common/Layout';
import { isAdminPanel, isAppPanel } from './utils/subdomain';

function App() {
  const { message, type, isVisible, hideToast } = useToast();
  const isAdmin = isAdminPanel();
  const isApp = isAppPanel();


  // Verificar se está em um subdomínio válido
  const hasValidSubdomain = isAdmin || isApp;

  return (
    <BrowserRouter>
      {/* Toast global */}
      <Toast
        message={message}
        type={type}
        isVisible={isVisible}
        onClose={hideToast}
      />

      {/* Retry Queue Indicator */}
      <RetryQueueIndicator />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-establishment" element={<SelectEstablishmentPage />} />
        <Route path="/menu/:establishmentSlug" element={<MenuPage />} />

        {/* Admin Panel Routes - apenas admin.* */}
        {isAdmin ? (
          <>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin_global">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* 404 para rotas inexistentes no painel admin */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                    <p className="text-gray-600 mb-4">Página não encontrada no painel administrativo</p>
                    <a href="/admin" className="text-blue-600 hover:text-blue-800 underline">
                      Voltar para o painel
                    </a>
                  </div>
                </div>
              }
            />
          </>
        ) : isApp ? (
          <>
            {/* App Panel Routes - app.* */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/new"
              element={
                <ProtectedRoute>
                  <NewOrderPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute requireRole="owner">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <ProtectedRoute requireRole="owner">
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            {/* Redirecionar / para /dashboard no painel app */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 para rotas inexistentes no painel app */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                    <p className="text-gray-600 mb-4">Página não encontrada</p>
                    <a href="/dashboard" className="text-primary-600 hover:text-primary-800 underline">
                      Voltar para o dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </>
        ) : (
          <>
            {/* Sem subdomínio válido - apenas login e mensagem de erro */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-md px-6">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">⚠️ Acesso Inválido</h1>
                    <p className="text-gray-700 mb-6">
                      Este sistema requer acesso através dos subdomínios configurados:
                    </p>
                    <div className="bg-white rounded-lg shadow p-6 mb-6 text-left">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong className="text-gray-900">Painel Administrativo:</strong>
                        <br />
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          http://admin.localhost:5173
                        </code>
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-900">Painel de Estabelecimento:</strong>
                        <br />
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          http://app.localhost:5173
                        </code>
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Por favor, acesse o sistema através de um dos subdomínios acima.
                    </p>
                  </div>
                </div>
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
