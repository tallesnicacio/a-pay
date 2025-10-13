import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { NewOrderPage } from './pages/NewOrderPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { KitchenPage } from './pages/KitchenPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Toast, useToast } from './components/common/Toast';
import { RetryQueueIndicator } from './components/common/RetryQueueIndicator';

function App() {
  const { message, type, isVisible, hideToast } = useToast();

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

        {/* Protected routes */}
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
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to orders */}
        <Route path="/" element={<Navigate to="/orders" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600">Página não encontrada</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
