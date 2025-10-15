import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { isAdminPanel } from '../utils/subdomain';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, user, currentEstablishment } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      showToast('Login realizado com sucesso!', 'success', 'Bem-vindo!');

      const isAdmin = isAdminPanel();
      const from = (location.state as any)?.from?.pathname;

      // Verificar se precisa selecionar estabelecimento
      const authUser = useAuthStore.getState().user;
      const currentEst = useAuthStore.getState().currentEstablishment;
      const isAdminGlobal = authUser?.roles.some(r => r.role === 'admin_global');

      if (from) {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (!isAdminGlobal && !currentEst) {
        // Se não é admin global e não tem estabelecimento selecionado
        navigate('/select-establishment', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      showToast(error || 'Erro ao fazer login', 'error', 'Ops!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-2xl shadow-primary mb-4">
            <span className="text-white font-bold text-3xl font-display">A</span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2 font-display">
            A-Pay
          </h1>
          <p className="text-neutral-600">Sistema de Controle de Pedidos</p>
          {isAdminPanel() && (
            <div className="mt-3">
              <Badge variant="primary" size="md">
                Painel Administrativo
              </Badge>
            </div>
          )}
        </div>

        <Card padding="lg" className="shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              }
            />

            {error && (
              <div className="flex items-start gap-3 p-4 bg-danger-50 border-2 border-danger-200 rounded-lg">
                <svg className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-danger-800 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-primary"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            © 2025 A-Pay. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
