import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import type { AuthUser, AuthUserRole } from '../types/auth';

// Criar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Middleware de autenticação Supabase
 * Valida o token do Supabase e injeta os dados do usuário no request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token não fornecido');
    }

    // Extrair token (formato: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer <token>');
    }

    // Verificar token com Supabase
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !supabaseUser) {
      console.error('[Auth Middleware] Erro ao validar token Supabase:', authError);
      throw new UnauthorizedError('Token inválido ou expirado');
    }


    // Buscar dados do usuário na tabela users
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
          permissions
        )
      `)
      .eq('id', supabaseUser.id)
      .single();

    if (userError || !userData) {
      console.error('[Auth Middleware] Erro ao buscar dados do usuário:', userError);
      throw new UnauthorizedError('Usuário não encontrado');
    }

    if (!userData.active) {
      throw new UnauthorizedError('Usuário desativado');
    }

    // Transformar user_roles para o formato esperado
    const roles: AuthUserRole[] = userData.user_roles.map((ur: any) => ({
      id: ur.id,
      role: ur.role,
      establishmentId: ur.establishment_id,
      permissions: ur.permissions,
    }));

    // Construir objeto de usuário autenticado
    const authUser: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      active: userData.active,
      roles,
    };

    // Determinar establishment_id do contexto
    // Prioridade: header > query > primeiro papel do usuário
    let establishmentId =
      (request.headers['x-establishment-id'] as string) ||
      (request.query as any)?.establishmentId;

    // Se não fornecido, usar o primeiro estabelecimento do usuário
    if (!establishmentId) {
      const firstRole = authUser.roles.find(role => role.establishmentId);
      establishmentId = firstRole?.establishmentId || null;
    }

    // Verificar se usuário tem acesso ao estabelecimento
    const hasAccess =
      authUser.roles.some(role => role.role === 'admin_global') ||
      authUser.roles.some(role => role.establishmentId === establishmentId);

    if (!hasAccess && establishmentId) {
      throw new ForbiddenError('Acesso negado ao estabelecimento');
    }

    // Encontrar o role atual baseado no estabelecimento
    const currentRole = establishmentId
      ? authUser.roles.find(r => r.establishmentId === establishmentId)
      : authUser.roles.find(r => r.role === 'admin_global');

    // Anexar ao request
    request.user = authUser;
    request.establishmentId = establishmentId || undefined;
    request.currentRole = currentRole || null;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      throw error;
    }
    console.error('[Auth Middleware] Erro inesperado:', error);
    throw new UnauthorizedError(
      error instanceof Error ? error.message : 'Token inválido'
    );
  }
}

/**
 * Middleware para verificar papéis específicos
 * Deve ser usado APÓS authMiddleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const hasRole = request.user.roles.some(role =>
      allowedRoles.includes(role.role)
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Acesso negado. Papéis permitidos: ${allowedRoles.join(', ')}`
      );
    }
  };
}

/**
 * Middleware para verificar se usuário é owner do estabelecimento atual
 * Deve ser usado APÓS authMiddleware
 */
export function requireOwner() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!request.currentRole) {
      throw new ForbiddenError('Contexto de estabelecimento não definido');
    }

    if (
      request.currentRole.role !== 'owner' &&
      request.currentRole.role !== 'admin_global'
    ) {
      throw new ForbiddenError('Apenas owners podem realizar esta ação');
    }
  };
}

/**
 * Middleware para verificar permissão específica
 * Deve ser usado APÓS authMiddleware
 */
export function requirePermission(module: 'orders' | 'kitchen' | 'reports') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    if (!request.currentRole) {
      throw new ForbiddenError('Contexto de estabelecimento não definido');
    }

    // Admin global e owner têm acesso a tudo
    if (
      request.currentRole.role === 'admin_global' ||
      request.currentRole.role === 'owner'
    ) {
      return;
    }

    // User precisa ter permissão específica
    if (request.currentRole.role === 'user') {
      const permissions = request.currentRole.permissions;

      if (!permissions || !permissions.modules[module]) {
        throw new ForbiddenError(`Acesso negado ao módulo: ${module}`);
      }
    }
  };
}
