import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { User, Establishment } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  currentEstablishment: Establishment | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setCurrentEstablishment: (establishment: Establishment) => void;
  verifyAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      currentEstablishment: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[AuthStore] Fazendo login...');
          const response = await authApi.login(email, password);
          const { accessToken, refreshToken, user } = response;

          console.log('[AuthStore] Login bem-sucedido:', { user });

          // Salvar tokens no localStorage
          localStorage.setItem('apay_access_token', accessToken);
          localStorage.setItem('apay_refresh_token', refreshToken);

          // Se usuário tem apenas um estabelecimento, selecionar automaticamente
          const establishmentRoles = user.roles.filter(r => r.establishmentId !== null);
          const currentEstablishment =
            establishmentRoles.length === 1 && establishmentRoles[0].establishmentId
              ? {
                  id: establishmentRoles[0].establishmentId,
                  name: establishmentRoles[0].establishmentName || '',
                  role: establishmentRoles[0].role
                }
              : null;

          if (currentEstablishment) {
            console.log('[AuthStore] Estabelecimento selecionado:', currentEstablishment);
            localStorage.setItem(
              'apay_establishment_id',
              currentEstablishment.id
            );
          }

          set({
            accessToken,
            refreshToken,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('[AuthStore] Estado atualizado, isAuthenticated:', true);
        } catch (error: any) {
          console.error('[AuthStore] Erro no login:', error);
          const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        console.log('[AuthStore] Fazendo logout...');
        localStorage.removeItem('apay_access_token');
        localStorage.removeItem('apay_refresh_token');
        localStorage.removeItem('apay_user');
        localStorage.removeItem('apay_establishment_id');

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          currentEstablishment: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setCurrentEstablishment: (establishment: Establishment) => {
        localStorage.setItem('apay_establishment_id', establishment.id);
        set({ currentEstablishment: establishment });
      },

      verifyAuth: async () => {
        const accessToken = localStorage.getItem('apay_access_token');
        if (!accessToken) {
          console.log('[AuthStore] Sem access token, desautenticando');
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        console.log('[AuthStore] Verificando autenticação...');
        set({ isLoading: true });

        try {
          const { user } = await authApi.me();
          console.log('[AuthStore] Usuário verificado:', user);

          const establishmentId = localStorage.getItem('apay_establishment_id');
          const establishmentRole = establishmentId
            ? user.roles.find((r) => r.establishmentId === establishmentId)
            : null;

          const currentEstablishment = establishmentRole && establishmentRole.establishmentId
            ? {
                id: establishmentRole.establishmentId,
                name: establishmentRole.establishmentName || '',
                role: establishmentRole.role
              }
            : null;

          set({
            accessToken,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.warn('[AuthStore] Erro ao verificar auth, tentando refresh...', error);

          // Se o access token expirou, tentar refresh
          const refreshToken = localStorage.getItem('apay_refresh_token');
          if (refreshToken) {
            try {
              console.log('[AuthStore] Tentando refresh token...');
              const response = await authApi.refresh(refreshToken);
              localStorage.setItem('apay_access_token', response.accessToken);
              localStorage.setItem('apay_refresh_token', response.refreshToken);

              // Tentar novamente pegar dados do usuário
              const { user } = await authApi.me();
              console.log('[AuthStore] Refresh bem-sucedido, usuário:', user);

              const establishmentId = localStorage.getItem('apay_establishment_id');
              const establishmentRole = establishmentId
                ? user.roles.find((r) => r.establishmentId === establishmentId)
                : null;

              const currentEstablishment = establishmentRole && establishmentRole.establishmentId
                ? {
                    id: establishmentRole.establishmentId,
                    name: establishmentRole.establishmentName || '',
                    role: establishmentRole.role
                  }
                : null;

              set({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                user,
                currentEstablishment,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            } catch (refreshError) {
              console.error('[AuthStore] Refresh falhou:', refreshError);
              // Refresh também falhou, fazer logout
              get().logout();
            }
          } else {
            console.log('[AuthStore] Sem refresh token, fazendo logout');
            get().logout();
          }
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'apay-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        currentEstablishment: state.currentEstablishment,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
