import { Role } from '@prisma/client';

/**
 * Dados de autenticação do usuário
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  active: boolean;
  roles: AuthUserRole[];
}

/**
 * Role do usuário em um estabelecimento
 */
export interface AuthUserRole {
  establishmentId: string | null;
  establishmentName?: string;
  role: Role;
  permissions?: UserPermissions;
}

/**
 * Permissões configuráveis para role "user"
 */
export interface UserPermissions {
  modules: {
    orders: boolean; // Acesso ao módulo de comandas
    kitchen: boolean; // Acesso ao módulo de cozinha
    reports: boolean; // Acesso aos relatórios (view only)
  };
}

/**
 * Permissões padrão por role
 */
export const DEFAULT_PERMISSIONS: Record<Role, UserPermissions | null> = {
  admin_global: null, // Admin global tem acesso total, não precisa de permissões específicas
  owner: null, // Owner tem acesso total ao seu estabelecimento
  user: {
    // User começa sem acesso a nada, owner deve configurar
    modules: {
      orders: false,
      kitchen: false,
      reports: false,
    },
  },
};

/**
 * Request de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response de login
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: AuthUserRole[];
  };
}

/**
 * Request de refresh token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Response de refresh token
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Request de criação de usuário (owner criando funcionário)
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'user';
  permissions?: UserPermissions; // Obrigatório se role = 'user'
}

/**
 * Request de atualização de permissões
 */
export interface UpdatePermissionsRequest {
  permissions: UserPermissions;
}

/**
 * Contexto de autenticação disponível no request
 */
export interface AuthContext {
  user: AuthUser;
  currentEstablishment: string | null;
  currentRole: AuthUserRole | null;
}

/**
 * Helper para verificar se usuário tem role específica
 */
export function hasRole(user: AuthUser, role: Role, establishmentId?: string): boolean {
  if (!establishmentId) {
    return user.roles.some((r) => r.role === role);
  }

  return user.roles.some((r) => r.role === role && r.establishmentId === establishmentId);
}

/**
 * Helper para verificar se usuário tem permissão específica
 */
export function hasPermission(
  role: AuthUserRole,
  module: keyof UserPermissions['modules']
): boolean {
  // Admin global e owner têm acesso a tudo
  if (role.role === 'admin_global' || role.role === 'owner') {
    return true;
  }

  // User depende das permissões configuradas
  if (role.role === 'user' && role.permissions) {
    return role.permissions.modules[module] === true;
  }

  return false;
}

/**
 * Helper para verificar se usuário é owner de um estabelecimento
 */
export function isOwner(user: AuthUser, establishmentId: string): boolean {
  return hasRole(user, 'owner', establishmentId);
}

/**
 * Helper para verificar se usuário é admin global
 */
export function isAdminGlobal(user: AuthUser): boolean {
  return hasRole(user, 'admin_global');
}
