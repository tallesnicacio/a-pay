import { prisma } from '../../shared/database/prisma.service';
import { UnauthorizedError, NotFoundError } from '../../shared/utils/errors';
import logger from '../../shared/utils/logger';

export class AuthService {
  /**
   * Login simplificado para MVP
   * Em produção, usar Supabase Magic Link
   */
  async login(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            establishment: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // MVP: Token = userId
    // Produção: Gerar JWT real ou usar Supabase
    const token = user.id;

    logger.info({ userId: user.id, email }, 'User logged in');

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        establishments: user.userRoles
          .filter(r => r.establishment)
          .map(r => ({
            id: r.establishment!.id,
            name: r.establishment!.name,
            role: r.role,
          })),
      },
    };
  }

  /**
   * Verificar token (MVP)
   */
  async verifyToken(token: string) {
    const user = await prisma.user.findUnique({
      where: { id: token },
      include: {
        userRoles: {
          include: {
            establishment: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Token inválido');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        establishments: user.userRoles
          .filter(r => r.establishment)
          .map(r => ({
            id: r.establishment!.id,
            name: r.establishment!.name,
            role: r.role,
          })),
      },
    };
  }

  /**
   * Buscar usuário por ID com establishments
   */
  async getUserById(userId: string) {
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
      throw new NotFoundError('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      establishments: user.userRoles
        .filter(r => r.establishment)
        .map(r => ({
          id: r.establishment!.id,
          name: r.establishment!.name,
          role: r.role,
        })),
    };
  }
}

export const authService = new AuthService();
