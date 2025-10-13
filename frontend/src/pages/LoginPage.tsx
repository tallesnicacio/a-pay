import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { useToast } from '../components/common/Toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email);
      showToast('Login realizado com sucesso!', 'success');

      // Redirecionar para a página que o usuário estava tentando acessar
      // ou para /orders se não houver página anterior
      const from = (location.state as any)?.from?.pathname || '/orders';
      navigate(from, { replace: true });
    } catch (err) {
      showToast(error || 'Erro ao fazer login', 'error');
    }
  };

  // Sugestões de emails para facilitar o teste
  const quickEmails = [
    { email: 'admin@apay.com', label: 'Admin' },
    { email: 'garcom@churrasquinho.com', label: 'Garçom' },
    { email: 'cozinha@churrasquinho.com', label: 'Cozinha' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">A-Pay</h1>
          <p className="text-gray-600">Sistema de Controle de Pedidos</p>
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
            {quickEmails.map((item) => (
              <button
                key={item.email}
                type="button"
                onClick={() => setEmail(item.email)}
                className="px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>MVP - Autenticação simplificada</p>
          <p className="text-xs mt-1">
            Em produção, será usado Supabase Magic Link
          </p>
        </div>
      </Card>
    </div>
  );
}
