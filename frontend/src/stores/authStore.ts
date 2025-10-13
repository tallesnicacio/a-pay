import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { User, Establishment } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  currentEstablishment: Establishment | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string) => Promise<void>;
  logout: () => void;
  setCurrentEstablishment: (establishment: Establishment) => void;
  verifyAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      currentEstablishment: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.login(email);

          localStorage.setItem('apay_token', token);

          // Se usuário tem apenas um estabelecimento, selecionar automaticamente
          const currentEstablishment =
            user.establishments.length === 1 ? user.establishments[0] : null;

          if (currentEstablishment) {
            localStorage.setItem(
              'apay_establishment_id',
              currentEstablishment.id
            );
          }

          set({
            token,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Erro ao fazer login',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('apay_token');
        localStorage.removeItem('apay_user');
        localStorage.removeItem('apay_establishment_id');

        set({
          token: null,
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
        const token = localStorage.getItem('apay_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { user } = await authApi.me();

          const establishmentId = localStorage.getItem('apay_establishment_id');
          const currentEstablishment = establishmentId
            ? user.establishments.find((e) => e.id === establishmentId) || null
            : null;

          set({
            token,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'apay-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        currentEstablishment: state.currentEstablishment,
      }),
    }
  )
);
