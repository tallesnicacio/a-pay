import { prisma } from '../../shared/database/prisma.service';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../shared/utils/errors';
import { hashPassword } from '../../shared/utils/password';
import type { CreateEmployeeBody, UpdateEmployeeBody } from './employees.schema';

export class EmployeesService {
  /**
   * Listar funcionários do estabelecimento do owner
   */
  async listEmployees(establishmentId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: {
        establishmentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userRoles.map((ur) => ({
      id: ur.id,
      userId: ur.user.id,
      email: ur.user.email,
      name: ur.user.name,
      active: ur.user.active,
      role: ur.role,
      permissions: ur.permissions,
      createdAt: ur.user.createdAt,
    }));
  }

  /**
   * Criar funcionário
   */
  async createEmployee(data: CreateEmployeeBody, establishmentId: string) {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email já está em uso');
    }

    // Validar permissões para role 'user'
    if (data.role === 'user' && !data.permissions) {
      throw new BadRequestError('Permissões são obrigatórias para role "user"');
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.password);

    // Criar usuário e role em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          active: true,
        },
      });

      // Criar UserRole
      const userRole = await tx.userRole.create({
        data: {
          userId: user.id,
          establishmentId,
          role: data.role,
          permissions: data.permissions || null,
        },
      });

      return { user, userRole };
    });

    return {
      id: result.userRole.id,
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      active: result.user.active,
      role: result.userRole.role,
      permissions: result.userRole.permissions,
      createdAt: result.user.createdAt,
    };
  }

  /**
   * Atualizar funcionário
   */
  async updateEmployee(
    userRoleId: string,
    data: UpdateEmployeeBody,
    establishmentId: string
  ) {
    // Verificar se UserRole pertence ao estabelecimento
    const userRole = await prisma.userRole.findFirst({
      where: {
        id: userRoleId,
        establishmentId,
      },
      include: {
        user: true,
      },
    });

    if (!userRole) {
      throw new NotFoundError('Funcionário não encontrado');
    }

    // Não permitir alterar owner
    if (userRole.role === 'owner') {
      throw new ForbiddenError('Não é possível alterar o owner do estabelecimento');
    }

    // Atualizar em transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário
      const updateUserData: any = {};
      if (data.name) updateUserData.name = data.name;
      if (data.email) updateUserData.email = data.email;
      if (data.active !== undefined) updateUserData.active = data.active;

      let updatedUser = userRole.user;
      if (Object.keys(updateUserData).length > 0) {
        updatedUser = await tx.user.update({
          where: { id: userRole.userId },
          data: updateUserData,
        });
      }

      // Atualizar permissões
      let updatedUserRole = userRole;
      if (data.permissions) {
        updatedUserRole = await tx.userRole.update({
          where: { id: userRoleId },
          data: {
            permissions: data.permissions,
          },
        });
      }

      return { user: updatedUser, userRole: updatedUserRole };
    });

    return {
      id: result.userRole.id,
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      active: result.user.active,
      role: result.userRole.role,
      permissions: result.userRole.permissions,
      createdAt: result.user.createdAt,
    };
  }

  /**
   * Deletar funcionário
   */
  async deleteEmployee(userRoleId: string, establishmentId: string) {
    // Verificar se UserRole pertence ao estabelecimento
    const userRole = await prisma.userRole.findFirst({
      where: {
        id: userRoleId,
        establishmentId,
      },
    });

    if (!userRole) {
      throw new NotFoundError('Funcionário não encontrado');
    }

    // Não permitir deletar owner
    if (userRole.role === 'owner') {
      throw new ForbiddenError('Não é possível remover o owner do estabelecimento');
    }

    // Deletar UserRole (soft delete do user seria melhor, mas vamos deletar a role)
    await prisma.userRole.delete({
      where: { id: userRoleId },
    });
  }
}

export const employeesService = new EmployeesService();
