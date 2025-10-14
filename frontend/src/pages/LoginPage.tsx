import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { useToast } from '../components/common/Toast';
import { isAdminPanel, isAppPanel } from '../utils/subdomain';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      showToast('Login realizado com sucesso!', 'success');

      // Redirecionar baseado no subdomínio
      const isAdmin = isAdminPanel();
      const from = (location.state as any)?.from?.pathname;

      if (from) {
        // Se tinha uma página anterior, vai para ela
        navigate(from, { replace: true });
      } else if (isAdmin) {
        // Se está no admin.localhost, vai para /admin
        navigate('/admin', { replace: true });
      } else {
        // Se está no app.localhost ou localhost, vai para /orders
        navigate('/orders', { replace: true });
      }
    } catch (err) {
      showToast(error || 'Erro ao fazer login', 'error');
    }
  };

  // Logins rápidos para facilitar o teste
  const quickLogins = [
    { email: 'admin@apay.com', label: 'Admin', password: 'senha123' },
    { email: 'owner@churrasquinho.com', label: 'Owner', password: 'senha123' },
    { email: 'joao@churrasquinho.com', label: 'João', password: 'senha123' },
  ];

  const handleQuickLogin = (quickLogin: { email: string; password: string }) => {
    setEmail(quickLogin.email);
    setPassword(quickLogin.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">A-Pay</h1>
          <p className="text-gray-600">Sistema de Controle de Pedidos</p>
          {isAdminPanel() && (
            <p className="text-xs text-primary-600 mt-2 font-semibold">
              Painel Administrativo
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        {/* Quick access para desenvolvimento */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Acesso rápido (desenvolvimento):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quickLogins.map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => handleQuickLogin(item)}
                className="px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Senha padrão: senha123
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Autenticação JWT</p>
          <p className="text-xs mt-1">
            Access token expira em 15 minutos
          </p>
        </div>
      </Card>
    </div>
  );
}
