import { prisma } from '../../shared/database/prisma.service';
import { UnauthorizedError, NotFoundError } from '../../shared/utils/errors';
import logger from '../../shared/utils/logger';
import { comparePassword } from '../../shared/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';
import type { AuthUserRole } from '../../shared/types/auth';

export class AuthService {
  /**
   * Login com email e senha
   */
  async login(email: string, password: string) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    if (!user.active) {
      throw new UnauthorizedError('Usuário desativado');
    }

    // Verificar senha
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    // Montar roles do usuário
    const roles: AuthUserRole[] = user.userRoles.map((ur) => ({
      establishmentId: ur.establishmentId,
      establishmentName: ur.establishment?.name,
      role: ur.role,
      permissions: ur.permissions as any,
    }));

    // Gerar tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
    });

    const refreshToken = generateRefreshToken(user.id);

    logger.info({ userId: user.id, email }, 'User logged in');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
      },
    };
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verificar refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Buscar usuário atualizado
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: {
          userRoles: {
            include: {
              establishment: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.active) {
        throw new UnauthorizedError('Usuário não encontrado ou desativado');
      }

      // Montar roles do usuário
      const roles: AuthUserRole[] = user.userRoles.map((ur) => ({
        establishmentId: ur.establishmentId,
        establishmentName: ur.establishment?.name,
        role: ur.role,
        permissions: ur.permissions as any,
      }));

      // Gerar novos tokens
      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        name: user.name,
        roles,
      });

      const newRefreshToken = generateRefreshToken(user.id);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError(
        error instanceof Error ? error.message : 'Refresh token inválido'
      );
    }
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
            establishment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (!user.active) {
      throw new UnauthorizedError('Usuário desativado');
    }

    // Montar roles do usuário
    const roles: AuthUserRole[] = user.userRoles.map((ur) => ({
      establishmentId: ur.establishmentId,
      establishmentName: ur.establishment?.name,
      role: ur.role,
      permissions: ur.permissions as any,
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      roles,
    };
  }
}

export const authService = new AuthService();
