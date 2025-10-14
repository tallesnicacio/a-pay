import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import type { JWTPayload } from '../utils/jwt';
import type { AuthUser, AuthUserRole } from '../types/auth';

/**
 * Middleware de autenticação JWT
 * Valida o access token e injeta os dados do usuário no request
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

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('Formato de token inválido. Use: Bearer <token>');
    }

    // Verificar e decodificar JWT
    const decoded: JWTPayload = verifyAccessToken(token);

    // Construir objeto de usuário autenticado
    const authUser: AuthUser = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      active: true, // JWT válido = usuário ativo
      roles: decoded.roles,
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
