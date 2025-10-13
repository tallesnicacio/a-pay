import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../../shared/database/prisma.service';
import { AuthUser } from '../types/auth.types';

/**
 * Middleware de autenticação simplificado para MVP
 *
 * Para produção, integrar com Supabase Auth:
 * - Validar JWT do Supabase
 * - Verificar sessão ativa
 * - Rate limiting por usuário
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token não fornecido');
    }

    const token = authHeader.replace('Bearer ', '');

    // MVP: Token simples = userId
    // Produção: Validar JWT real
    const userId = token;

    // Buscar usuário e seus papéis
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            establishment: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Determinar establishment_id do contexto
    // Prioridade: header > query > primeiro papel do usuário
    let establishmentId =
      (request.headers['x-establishment-id'] as string) ||
      (request.query as any)?.establishmentId;

    // Se não fornecido, usar o primeiro estabelecimento do usuário
    if (!establishmentId) {
      const firstRole = user.userRoles.find(role => role.establishmentId);
      establishmentId = firstRole?.establishmentId || undefined;
    }

    // Verificar se usuário tem acesso ao estabelecimento
    const hasAccess =
      user.userRoles.some(role => role.role === 'admin_global') ||
      user.userRoles.some(role => role.establishmentId === establishmentId);

    if (!hasAccess && establishmentId) {
      throw new UnauthorizedError('Acesso negado ao estabelecimento');
    }

    // Construir objeto de usuário autenticado
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      establishmentId: establishmentId,
      roles: user.userRoles.map(r => r.role),
    };

    // Anexar ao request
    request.user = authUser;
    request.establishmentId = establishmentId;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Token inválido');
  }
}

/**
 * Middleware para verificar papéis específicos
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Usuário não autenticado');
    }

    const hasRole = request.user.roles.some(role =>
      allowedRoles.includes(role)
    );

    if (!hasRole) {
      throw new UnauthorizedError(
        `Acesso negado. Papéis permitidos: ${allowedRoles.join(', ')}`
      );
    }
  };
}
