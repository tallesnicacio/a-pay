import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, Establishment } from '../types';

interface AuthState {
  supabaseUser: SupabaseUser | null;
  user: User | null;
  currentEstablishment: Establishment | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentEstablishment: (establishment: Establishment) => void;
  verifyAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      supabaseUser: null,
      user: null,
      currentEstablishment: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[AuthStore] Fazendo login com Supabase Auth...');

          // 1. Login no Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            throw new Error(authError.message);
          }

          if (!authData.user) {
            throw new Error('Usuário não encontrado');
          }

          console.log('[AuthStore] Login Supabase bem-sucedido:', authData.user.email);

          // 2. Buscar dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              name,
              active,
              user_roles (
                id,
                role,
                establishment_id,
                permissions,
                establishment:establishments (
                  id,
                  name,
                  slug,
                  has_kitchen,
                  has_orders,
                  has_reports,
                  online_ordering,
                  active
                )
              )
            `)
            .eq('id', authData.user.id)
            .single();

          if (userError || !userData) {
            console.error('[AuthStore] Erro ao buscar dados do usuário:', userError);
            throw new Error('Erro ao buscar dados do usuário');
          }

          console.log('[AuthStore] Dados do usuário carregados:', userData);

          // 3. Transformar dados para o formato esperado
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            active: userData.active,
            roles: userData.user_roles.map((ur: any) => ({
              id: ur.id,
              role: ur.role,
              establishmentId: ur.establishment_id,
              establishmentName: ur.establishment?.name || null,
              establishmentSlug: ur.establishment?.slug || null,
              hasKitchen: ur.establishment?.has_kitchen,
              hasOrders: ur.establishment?.has_orders,
              hasReports: ur.establishment?.has_reports,
              onlineOrdering: ur.establishment?.online_ordering,
              active: ur.establishment?.active,
              permissions: ur.permissions,
            })),
          };

          // 4. Se usuário tem apenas um estabelecimento, selecionar automaticamente
          const establishmentRoles = user.roles.filter(r => r.establishmentId !== null);
          const currentEstablishment =
            establishmentRoles.length === 1 && establishmentRoles[0].establishmentId
              ? {
                  id: establishmentRoles[0].establishmentId,
                  name: establishmentRoles[0].establishmentName || '',
                  slug: (establishmentRoles[0] as any).establishmentSlug,
                  role: establishmentRoles[0].role,
                  hasKitchen: (establishmentRoles[0] as any).hasKitchen,
                  hasOrders: (establishmentRoles[0] as any).hasOrders,
                  hasReports: (establishmentRoles[0] as any).hasReports,
                  onlineOrdering: (establishmentRoles[0] as any).onlineOrdering,
                  active: (establishmentRoles[0] as any).active,
                }
              : null;

          if (currentEstablishment) {
            console.log('[AuthStore] Estabelecimento selecionado:', currentEstablishment);
            localStorage.setItem('apay_establishment_id', currentEstablishment.id);
          }

          set({
            supabaseUser: authData.user,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('[AuthStore] Estado atualizado, isAuthenticated:', true);
        } catch (error: any) {
          console.error('[AuthStore] Erro no login:', error);
          const errorMessage = error.message || 'Erro ao fazer login';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const currentState = get();

        // Evitar loop se já estamos desconectados
        if (!currentState.isAuthenticated && !currentState.user) {
          console.log('[AuthStore] Já desconectado, ignorando logout');
          return;
        }

        console.log('[AuthStore] Fazendo logout...');

        // Limpar estado primeiro
        set({
          supabaseUser: null,
          user: null,
          currentEstablishment: null,
          isAuthenticated: false,
          error: null,
        });

        // Limpar localStorage
        localStorage.removeItem('apay_establishment_id');

        // Logout do Supabase (isso dispara o evento SIGNED_OUT, mas já limpamos o estado)
        await supabase.auth.signOut();
      },

      setCurrentEstablishment: (establishment: Establishment) => {
        localStorage.setItem('apay_establishment_id', establishment.id);
        set({ currentEstablishment: establishment });
      },

      verifyAuth: async () => {
        console.log('[AuthStore] Verificando autenticação com Supabase...');
        set({ isLoading: true });

        try {
          // 1. Verificar sessão do Supabase
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !session) {
            console.log('[AuthStore] Sem sessão válida');
            set({ isAuthenticated: false, isLoading: false });
            return;
          }

          console.log('[AuthStore] Sessão válida encontrada:', session.user.email);

          // 2. Buscar dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              name,
              active,
              user_roles (
                id,
                role,
                establishment_id,
                permissions,
                establishment:establishments (
                  id,
                  name,
                  slug,
                  has_kitchen,
                  has_orders,
                  has_reports,
                  online_ordering,
                  active
                )
              )
            `)
            .eq('id', session.user.id)
            .single();

          if (userError || !userData) {
            console.error('[AuthStore] Erro ao buscar dados do usuário:', userError);
            get().logout();
            return;
          }

          // 3. Transformar dados
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            active: userData.active,
            roles: userData.user_roles.map((ur: any) => ({
              id: ur.id,
              role: ur.role,
              establishmentId: ur.establishment_id,
              establishmentName: ur.establishment?.name || null,
              establishmentSlug: ur.establishment?.slug || null,
              hasKitchen: ur.establishment?.has_kitchen,
              hasOrders: ur.establishment?.has_orders,
              hasReports: ur.establishment?.has_reports,
              onlineOrdering: ur.establishment?.online_ordering,
              active: ur.establishment?.active,
              permissions: ur.permissions,
            })),
          };

          // 4. Restaurar estabelecimento se existir
          const establishmentId = localStorage.getItem('apay_establishment_id');
          const establishmentRole = establishmentId
            ? user.roles.find((r) => r.establishmentId === establishmentId)
            : null;

          const currentEstablishment = establishmentRole && establishmentRole.establishmentId
            ? {
                id: establishmentRole.establishmentId,
                name: establishmentRole.establishmentName || '',
                slug: establishmentRole.establishmentSlug || '',
                role: establishmentRole.role,
                hasKitchen: establishmentRole.hasKitchen,
                hasOrders: establishmentRole.hasOrders,
                hasReports: establishmentRole.hasReports,
                onlineOrdering: establishmentRole.onlineOrdering,
                active: establishmentRole.active,
              }
            : null;

          set({
            supabaseUser: session.user,
            user,
            currentEstablishment,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('[AuthStore] Autenticação verificada com sucesso');
        } catch (error: any) {
          console.error('[AuthStore] Erro ao verificar auth:', error);
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'apay-auth-supabase',
      partialize: (state) => ({
        // Não precisamos persistir tokens - Supabase gerencia isso automaticamente
        user: state.user,
        currentEstablishment: state.currentEstablishment,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Configurar listener para mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Auth] Estado mudou:', event, session?.user?.email);

  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Session foi atualizada, verificar auth novamente
    useAuthStore.getState().verifyAuth();
  }
});
