import { prisma } from '../../shared/database/prisma';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../shared/errors/AppError';
import { createAuditLog } from '../../shared/utils/audit';
import { hashPassword } from '../../shared/utils/password';
import type {
  CreateEstablishmentBody,
  UpdateEstablishmentBody,
  CreateUserBody,
  UpdateUserBody,
  CreateUserRoleBody,
  UpdateUserRoleBody,
  ListQuery,
} from './admin.schema';

export class AdminService {
  /**
   * Verificar se usuário é admin_global
   */
  private async verifyAdminGlobal(userId: string): Promise<void> {
    const adminRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: 'admin_global',
      },
    });

    if (!adminRole) {
      throw new ForbiddenError(
        'Acesso negado. Apenas admin_global pode executar esta operação.'
      );
    }
  }

  // ============================================================================
  // ESTABLISHMENTS
  // ============================================================================

  /**
   * Listar estabelecimentos (com paginação)
   */
  async listEstablishments(query: ListQuery, userId: string) {
    await this.verifyAdminGlobal(userId);

    const { page, limit, search, active } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [establishments, total] = await Promise.all([
      prisma.establishment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              products: true,
              orders: true,
            },
          },
        },
      }),
      prisma.establishment.count({ where }),
    ]);

    return {
      establishments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar estabelecimento por ID
   */
  async getEstablishmentById(id: string, userId: string) {
    await this.verifyAdminGlobal(userId);

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                active: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    return establishment;
  }

  /**
   * Criar estabelecimento
   */
  async createEstablishment(data: CreateEstablishmentBody, userId: string) {
    await this.verifyAdminGlobal(userId);

    // Verificar se slug já existe
    const existing = await prisma.establishment.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new BadRequestError('Slug já está em uso');
    }

    const establishment = await prisma.establishment.create({
      data,
    });

    // Audit log
    await createAuditLog({
      action: 'create_establishment',
      entity: 'establishment',
      entityId: establishment.id,
      userId,
      establishmentId: establishment.id,
      metadata: { name: establishment.name },
    });

    return establishment;
  }

  /**
   * Atualizar estabelecimento
   */
  async updateEstablishment(
    id: string,
    data: UpdateEstablishmentBody,
    userId: string
  ) {
    await this.verifyAdminGlobal(userId);

    // Verificar se existe
    const existing = await prisma.establishment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Verificar se novo slug já existe (se está mudando)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.establishment.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new BadRequestError('Slug já está em uso');
      }
    }

    const updated = await prisma.establishment.update({
      where: { id },
      data,
    });

    // Audit log
    await createAuditLog({
      action: 'update_establishment',
      entity: 'establishment',
      entityId: id,
      userId,
      establishmentId: id,
      metadata: { changes: data },
    });

    return updated;
  }

  /**
   * Deletar estabelecimento
   */
  async deleteEstablishment(id: string, userId: string) {
    await this.verifyAdminGlobal(userId);

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Prevenir deleção se tiver dados importantes
    if (establishment._count.orders > 0) {
      throw new BadRequestError(
        'Não é possível deletar estabelecimento com pedidos. Desative-o ao invés de deletar.'
      );
    }

    await prisma.establishment.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog({
      action: 'delete_establishment',
      entity: 'establishment',
      entityId: id,
      userId,
      establishmentId: id,
      metadata: { name: establishment.name },
    });

    return { message: 'Estabelecimento deletado com sucesso' };
  }

  // ============================================================================
  // USERS
  // ============================================================================

  /**
   * Listar usuários
   */
  async listUsers(query: ListQuery, userId: string) {
    await this.verifyAdminGlobal(userId);

    const { page, limit, search, active } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: {
            include: {
              establishment: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id: string, userId: string) {
    await this.verifyAdminGlobal(userId);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            establishment: {
              select: {
                id: true,
                name: true,
                slug: true,
                active: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Criar usuário
   */
  async createUser(data: CreateUserBody, userId: string) {
    await this.verifyAdminGlobal(userId);

    // Verificar se email já existe
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestError('Email já está em uso');
    }
    // Hash da senha
    const hashedPassword = await hashPassword(data.password);


    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    // Audit log
    await createAuditLog({
      action: 'create_user',
      entity: 'user',
      entityId: user.id,
      userId,
      establishmentId: null,
      metadata: { email: user.email, name: user.name },
    });

    return user;
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id: string, data: UpdateUserBody, userId: string) {
    await this.verifyAdminGlobal(userId);

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verificar se novo email já existe
    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new BadRequestError('Email já está em uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    // Audit log
    await createAuditLog({
      action: 'update_user',
      entity: 'user',
      entityId: id,
      userId,
      establishmentId: null,
      metadata: { changes: data },
    });

    return updated;
  }

  /**
   * Deletar usuário
   */
  async deleteUser(id: string, userId: string) {
    await this.verifyAdminGlobal(userId);

    // Não permitir self-delete
    if (id === userId) {
      throw new BadRequestError('Você não pode deletar sua própria conta');
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    await prisma.user.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog({
      action: 'delete_user',
      entity: 'user',
      entityId: id,
      userId,
      establishmentId: null,
      metadata: { email: user.email },
    });

    return { message: 'Usuário deletado com sucesso' };
  }

  // ============================================================================
  // USER ROLES
  // ============================================================================

  /**
   * Criar role de usuário (associar usuário a estabelecimento)
   */
  async createUserRole(data: CreateUserRoleBody, userId: string) {
    await this.verifyAdminGlobal(userId);

    // Verificar se user e establishment existem
    const [user, establishment] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.userId } }),
      prisma.establishment.findUnique({ where: { id: data.establishmentId } }),
    ]);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Verificar se role já existe
    const existing = await prisma.userRole.findFirst({
      where: {
        userId: data.userId,
        establishmentId: data.establishmentId,
      },
    });

    if (existing) {
      throw new BadRequestError(
        'Usuário já possui uma role neste estabelecimento'
      );
    }

    const userRole = await prisma.userRole.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      action: 'create_user_role',
      entity: 'user_role',
      entityId: userRole.id,
      userId,
      establishmentId: data.establishmentId,
      metadata: {
        targetUserId: data.userId,
        role: data.role,
      },
    });

    return userRole;
  }

  /**
   * Atualizar role de usuário
   */
  async updateUserRole(id: string, data: UpdateUserRoleBody, userId: string) {
    await this.verifyAdminGlobal(userId);

    const existing = await prisma.userRole.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Role não encontrada');
    }

    const updated = await prisma.userRole.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        establishment: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      action: 'update_user_role',
      entity: 'user_role',
      entityId: id,
      userId,
      establishmentId: existing.establishmentId,
      metadata: {
        targetUserId: existing.userId,
        oldRole: existing.role,
        newRole: data.role,
      },
    });

    return updated;
  }

  /**
   * Deletar role de usuário
   */
  async deleteUserRole(id: string, userId: string) {
    await this.verifyAdminGlobal(userId);

    const userRole = await prisma.userRole.findUnique({
      where: { id },
    });

    if (!userRole) {
      throw new NotFoundError('Role não encontrada');
    }

    await prisma.userRole.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog({
      action: 'delete_user_role',
      entity: 'user_role',
      entityId: id,
      userId,
      establishmentId: userRole.establishmentId,
      metadata: {
        targetUserId: userRole.userId,
        role: userRole.role,
      },
    });

    return { message: 'Role removida com sucesso' };
  }
}
